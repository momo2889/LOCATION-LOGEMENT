<?php

use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ListingController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\NeighborhoodController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\UploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API — TerangaLoc
|--------------------------------------------------------------------------
| Toutes les routes métier sont versionnées sous /api/v1. La santé de
| l'application est exposée hors version (contrat d'infrastructure stable).
*/

// Observabilité — GET /api/health
Route::get('/health', HealthController::class);

Route::prefix('v1')->group(function () {

    // -- Authentification (public) -------------------------------------------
    // Rate limiting global sur ces endpoints sensibles (anti-bruteforce),
    // en complément du verrou par email+IP côté contrôleur.
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    });

    // -- Référentiels publics -------------------------------------------------
    Route::get('/neighborhoods', [NeighborhoodController::class, 'index']);

    // -- Annonces (recherche + détail publics) -------------------------------
    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/{listing}', [ListingController::class, 'show']);

    // -- Routes authentifiées (token Sanctum) --------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/enable-owner', [ProfileController::class, 'enableOwnerSpace']);

        // Annonces du propriétaire connecté + CRUD (réservé au rôle owner).
        Route::get('/my-listings', [ListingController::class, 'mine']);
        Route::middleware('role:owner')->group(function () {
            Route::post('/listings', [ListingController::class, 'store']);
            Route::patch('/listings/{listing}', [ListingController::class, 'update']);
            Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
            Route::post('/uploads', [UploadController::class, 'store']); // photos d'annonce
        });

        // Messagerie (locataire ⇄ propriétaire).
        Route::get('/conversations', [MessageController::class, 'index']);
        Route::post('/conversations', [MessageController::class, 'start']);
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'messages']);
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'send']);

        // Exemple de zone réservée à l'admin (RBAC serveur) — enrichie en Phase 6.
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/ping', fn () => response()->json(['data' => 'pong admin']));
        });
    });
});
