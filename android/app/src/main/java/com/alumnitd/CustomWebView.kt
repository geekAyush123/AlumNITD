package com.alumnitd

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat

class CustomWebView(context: Context) : WebView(context) {

    init {
        settings.javaScriptEnabled = true
        // settings.geolocationEnabled = true
        webViewClient = WebViewClient()
        webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(context as MainActivity, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), 1)
                } else {
                    callback.invoke(origin, true, true)
                }
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                if (request.origin.toString().startsWith("https://")) {
                    request.grant(request.resources)
                } else {
                    super.onPermissionRequest(request)
                }
            }
        }
    }
}