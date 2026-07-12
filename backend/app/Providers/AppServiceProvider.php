<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiters();
        $this->configurePasswordResetUrl();
    }

    /**
     * Limiteurs de débit nommés, référencés par middleware('throttle:...').
     */
    private function configureRateLimiters(): void
    {
        // Endpoints d'authentification : 10 requêtes/minute par IP.
        // Défense de première ligne, complétée par le verrou email+IP du contrôleur.
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Limiteur par défaut de l'API (routes authentifiées) : 120 req/min par user/IP.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip()));
    }

    /**
     * Le lien de réinitialisation doit pointer vers le front React (SPA),
     * pas vers une route web Laravel inexistante.
     */
    private function configurePasswordResetUrl(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = rtrim((string) config('app.frontend_url'), '/');

            return $frontend.'/reset-password?token='.$token
                .'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
