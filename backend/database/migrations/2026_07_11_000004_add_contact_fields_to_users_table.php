<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Coordonnées de contact public du propriétaire, affichées sur ses annonces
 * pour permettre un contact direct (à la manière de Leboncoin) : WhatsApp et
 * Instagram. Le téléphone existe déjà sur la table users.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('whatsapp', 32)->nullable()->after('phone');   // numéro E.164, ex. +221771234567
            $table->string('instagram', 64)->nullable()->after('whatsapp'); // pseudo sans @
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['whatsapp', 'instagram']);
        });
    }
};
