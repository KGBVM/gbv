<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPartnerStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Ensure authenticated user exists
        |--------------------------------------------------------------------------
        */
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        /*
        |--------------------------------------------------------------------------
        | If user is admin or super admin, skip
        |--------------------------------------------------------------------------
        */
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return $next($request);
        }

        /*
        |--------------------------------------------------------------------------
        | Ensure user belongs to a partner
        |--------------------------------------------------------------------------
        */
        if (!$user->partner) {
            abort(403, 'Unauthorized.');
        }

        $partner = $user->partner;

        /*
        |--------------------------------------------------------------------------
        | Check account status
        |--------------------------------------------------------------------------
        */
        if ($partner->status !== 'approved') {
            return redirect()->route('partner.inactive');
        }

        /*
        |--------------------------------------------------------------------------
        | Check verification
        |--------------------------------------------------------------------------
        */
        if (is_null($partner->verified_at)) {
            return redirect()->route('partner.inactive');
        }

        /*
        |--------------------------------------------------------------------------
        | Check terms acceptance
        |--------------------------------------------------------------------------
        */
        if (!$partner->terms_accepted) {
            return redirect()->route('partner.inactive');
        }

        return $next($request);
    }
}
