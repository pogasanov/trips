<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\Request;

class BootstrapController extends Controller
{
    public function bootstrap(Request $request)
    {
        $user = $request->user();

        $organizations = Organization::all();
        $partners = $user->organization->partners;
        $per_diem_rates = $user->organization->per_diem_rates;
        $users = User::all();

        return response()->json([
            'user' => $user,
            'organizations' => $organizations,
            'partners' => $partners,
            'per_diem_rates' => $per_diem_rates,
            'users' => $users,
        ]);
    }
}
