<?php

use App\Http\Middleware\EnsureHasPermission;
use App\Http\Middleware\EnsureHasRole;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Configuration du noyau applicatif : routage, middlewares et rendu uniforme
 * des exceptions pour l'API. Les closures de rendu s'exécutent à l'exécution,
 * lorsque l'autoloader est disponible : on y utilise donc App\Support\ApiResponse.
 */
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias des middlewares RBAC utilisés dans les routes.
        $middleware->alias([
            'role' => EnsureHasRole::class,
            'permission' => EnsureHasPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Détermine si la requête attend une réponse JSON (toute la surface /api).
        $wantsJson = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e) => $wantsJson($request));

        // Rendu uniforme des exceptions les plus courantes.
        $exceptions->render(function (Throwable $e, Request $request) use ($wantsJson) {
            if (! $wantsJson($request)) {
                return null; // Laisse le comportement par défaut hors API.
            }

            return match (true) {
                $e instanceof ValidationException => ApiResponse::error(
                    'Les données envoyées sont invalides.',
                    422,
                    $e->errors(),
                    'VALIDATION_ERROR',
                ),
                $e instanceof AuthenticationException => ApiResponse::error(
                    'Authentification requise.', 401, code: 'UNAUTHENTICATED',
                ),
                $e instanceof AuthorizationException => ApiResponse::error(
                    'Action non autorisée.', 403, code: 'FORBIDDEN',
                ),
                $e instanceof ModelNotFoundException, $e instanceof NotFoundHttpException => ApiResponse::error(
                    'Ressource introuvable.', 404, code: 'NOT_FOUND',
                ),
                default => null, // Traité par le filet de sécurité ci-dessous.
            };
        });

        // Filet de sécurité : toute exception non gérée renvoie un message propre,
        // sans jamais fuiter de stack trace en production.
        $exceptions->render(function (Throwable $e, Request $request) use ($wantsJson) {
            if (! $wantsJson($request)) {
                return null;
            }

            // Erreurs HTTP explicites (ex. 429 throttle) : on respecte leur statut.
            if ($e instanceof HttpExceptionInterface) {
                return ApiResponse::error($e->getMessage() ?: 'Requête invalide.', $e->getStatusCode());
            }

            // Erreur inattendue : 500 générique + log serveur détaillé.
            Log::error('Erreur non gérée', ['exception' => $e]);

            $debug = config('app.debug');

            return ApiResponse::error(
                $debug ? $e->getMessage() : 'Une erreur interne est survenue. Veuillez réessayer.',
                HttpResponse::HTTP_INTERNAL_SERVER_ERROR,
                null,
                'SERVER_ERROR',
            );
        });
    })->create();
