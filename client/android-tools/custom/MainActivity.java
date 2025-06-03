package org.rti.tangerine;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import org.apache.cordova.*;

import java.io.File;
import java.util.Arrays;
import java.util.Comparator;

public class MainActivity extends CordovaActivity {

    private String lastHandledUri = null;
    private String latestVersionPath = null;
    private String activity_id = null;


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("MainActivity", "App started");

        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        latestVersionPath = findLatestVersionDir();

        if (latestVersionPath == null) {
            Log.e("MainActivity", "No hot code push version found, falling back to default www folder");
            loadUrl(launchUrl);  // fallback to default index.html in assets
        } else {
            String indexUrl = "file://" + latestVersionPath + "/www/shell/index.html";
            Log.d("MainActivity", "Loading base URL: " + indexUrl);
            loadUrl(indexUrl);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink(intent);
    }

    private String findLatestVersionDir() {
        String packageName = getApplicationContext().getPackageName();
        String basePath = "/data/user/0/" + packageName + "/files/cordova-hot-code-push-plugin/";
        File baseDir = new File(basePath);

        if (!baseDir.exists() || !baseDir.isDirectory()) {
            Log.e("MainActivity", "Base directory does not exist: " + basePath);
            return null;
        }

        File[] dirs = baseDir.listFiles(File::isDirectory);
        if (dirs == null || dirs.length == 0) {
            Log.e("MainActivity", "No version directories found in: " + basePath);
            return null;
        }

        Arrays.sort(dirs, Comparator.comparingLong(File::lastModified).reversed());
        Log.d("MainActivity", "Latest version folder: " + dirs[0].getAbsolutePath());
        return dirs[0].getAbsolutePath();
    }

    private void handleDeepLink(Intent intent) {
        Uri data = intent.getData();
        if (data != null) {
            String fullUrl = data.toString();
            if (fullUrl.equals(lastHandledUri)) return;
            lastHandledUri = fullUrl;

            activity_id = data.getQueryParameter("activity_id");

            String finalUrl = "file:///" + latestVersionPath + "/www/shell/#/tangy-forms/new/form-" + activity_id;

            if (latestVersionPath == null) {
                Log.e("DeepLink", "No latest version path available for deep link navigation.");
                return;
            }

            // Escape single quotes and backslashes in the URL to avoid JS syntax errors
            String escapedUrl = fullUrl.replace("\\", "\\\\").replace("'", "\\'");

            // Create JavaScript to wait for deviceready before navigating
            String js = "document.addEventListener('deviceready', function() {" +
                       "    setTimeout(function() {" +
                       "        window.location.href = '" + finalUrl + "';" +
                       "    }, 1000);" +
                       "}, false);";

            Log.d("DeepLink", "finalUrl: " + finalUrl);
            Log.d("DeepLink", "activity_id " + activity_id);

            // Post delayed runnable to inject JS after page likely loaded
            appView.getView().postDelayed(() -> {
                Log.d("DeepLink", "Injecting navigation script");
                appView.loadUrl("javascript:" + js);
            }, 1000);
        }
    }
}
