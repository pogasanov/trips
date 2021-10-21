<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::viaRequest('api-token', function (Request $request) {
            if (!$request->header('Authorization')) {
                return null;
            }
            $access_token = substr($request->header('Authorization'), 7);
            return User::where('api_token', $access_token)->first();
        });

        Auth::viaRequest('onec', function (Request $request) {
            if ($request->header('Authorization')) {
                $userpass = substr($request->header('Authorization'), strpos($request->header('Authorization'), 'Basic ') + 6);
                list($user, $pass) = explode(':', base64_decode($userpass));

                if ($user === config('services.onec.username') && $pass === config('services.onec.password')) {
                    return True;
                }
            }
            return null;
        });
    }
}
