<?php

namespace App\Http\Controllers;

use App\Models\HospitalAffiliation;
use Illuminate\Http\Request;

class HospitalAffiliationController extends Controller
{
    public function index()
    {
        return HospitalAffiliation::all();
    }

    public function show($id)
    {
        return HospitalAffiliation::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'contact_person' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'bed_strength' => 'nullable|integer',
            'specialties' => 'nullable|string',
            'address' => 'nullable|string',
        ]);
        $hospital = HospitalAffiliation::create($data);
        return response()->json($hospital, 201);
    }

    public function update(Request $request, $id)
    {
        $hospital = HospitalAffiliation::findOrFail($id);
        $hospital->update($request->all());
        return response()->json($hospital);
    }

    public function destroy($id)
    {
        $hospital = HospitalAffiliation::findOrFail($id);
        $hospital->delete();
        return response()->json(null, 204);
    }
}
