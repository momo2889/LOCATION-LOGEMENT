<?php

/*
|--------------------------------------------------------------------------
| Configuration CORS
|--------------------------------------------------------------------------
| Autorise le front React (origine FRONTEND_URL) à consommer l'API.
| On reste restrictif : seules les origines déclarées sont acceptées.
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Origines explicitement autorisées (jamais '*' en présence de credentials).
    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]),

    // En développement, le front statique peut être servi depuis n'importe quel
    // port local (Live Server 5500, `php -S`, http-server 8080…). On autorise
    // donc tout localhost / 127.0.0.1, quel que soit le port.
    // NB : sans cookies de credentials (supports_credentials=false), c'est sans risque.
    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Auth par token Bearer : pas besoin des cookies cross-site.
    // Passer à true seulement si l'on adopte l'auth SPA par cookie Sanctum.
    'supports_credentials' => false,

];
