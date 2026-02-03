<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultAnalytics;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResultAnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $analytics = ResultAnalytics::all();
        return response()->json(['success' => true, 'data' => $analytics]);
    }

    public function show($id): JsonResponse
    {
        $analytics = ResultAnalytics::findOrFail($id);
        return response()->json(['success' => true, 'data' => $analytics]);
    }
}
