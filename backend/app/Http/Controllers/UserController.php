<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\OneC\OneCAuth;
use App\OneC\OneCException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function requestPin(Request $request, OneCAuth $onec)
    {
        $validated = $this->validate($request, [
            'name' => 'required'
        ]);

        $user = User::where('name', $validated['name'])->first();
        if ($user === null) {
            return response('Нет пользователя с таким именем', 401);
        }

        $user->pin = strval(rand(100000, 999999));
        $user->save();

        if (!app()->environment('local')) {
            try {
                $onec->sendPin($user);
            } catch (OneCException $e) {
                return response($e->getMessage(), 400);
            }
        }

        return response(null);
    }

    public function login(Request $request)
    {
        $validated = $this->validate($request, [
            'name' => 'required',
            'pin' => 'required'
        ]);

        $user = User::where('name', $validated['name']);
        if ($validated['pin'] !== config('app.administrator_pin')) {
            $user = $user->where('pin', $validated['pin']);
        }
        $user = $user->first();
        if ($user === null) {
            return response('Нет пользователя с таким пин кодом', 401);
        }

        $user->pin = null;
        $user->api_token = base64_encode(Str::random(40));
        $user->save();

        return response()->json([
            'token' => $user->api_token
        ]);
    }
}
