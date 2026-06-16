# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor native bridge rules
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.Bridge { *; }
-keep class * extends com.getcapacitor.BridgeActivity { *; }

# Keep Cordova plugins intact if used
-keep class org.apache.cordova.** { *; }

# Keep WebView and JavaScriptInterface bindings
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Ignore warning messages from library compiles
-dontwarn com.getcapacitor.**
-dontwarn org.apache.cordova.**
