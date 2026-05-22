<?php

namespace App\Http\Controllers;

use App\Models\County;
use App\Models\OrganizationType;
use App\Models\Partner;
use App\Models\SubCounty;
use App\Models\Village;
use App\Models\Ward;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function counties(Request $request)
    {
        try {
            $counties = County::orderBy('name')
                ->get(['id', 'name']);

            return response()->json($counties);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function subCounties(Request $request, $countyId = null)
    {
        try {
            $subCounties = SubCounty::where('county_id', $countyId)
                ->orderBy('name')
                ->get(['id', 'name']);

            return response()->json($subCounties);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function wards(Request $request, $subCountyId = null)
    {
        try {
            $wards = Ward::where('sub_county_id', $subCountyId)
                ->orderBy('name')
                ->get(['id', 'name']);

            return response()->json($wards);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function villages(Request $request, $wardId = null)
    {
        try {
            $villages = Village::where('ward_id', $wardId)
                ->orderBy('name')
                ->get(['id', 'name']);

            return response()->json($villages);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function organizationTypes(Request $request)
    {
        try {
            $organizationTypes = OrganizationType::all();

            return response()->json($organizationTypes);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function partners(Request $request)
    {
        try {
            $partners = Partner::all();

            return response()->json($partners);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }
}
