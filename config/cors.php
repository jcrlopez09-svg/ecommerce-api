<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS de la API
    |--------------------------------------------------------------------------
    |
    | El frontend Next.js consume la API desde el servidor (Route Handlers,
    | Server Actions y Server Components), por lo que CORS no interviene.
    | Esta configuración permite además llamadas directas controladas desde
    | el navegador del frontend local cuando se necesiten (p. ej. depuración).
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,
];
