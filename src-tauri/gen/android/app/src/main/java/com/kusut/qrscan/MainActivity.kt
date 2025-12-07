package com.kusut.qrscan

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    handleShareIntent(intent)
    super.onCreate(savedInstanceState)
  }

  override fun onNewIntent(intent: Intent) {
    handleShareIntent(intent)
    super.onNewIntent(intent)
  }

  private fun handleShareIntent(intent: Intent) {
    if (Intent.ACTION_SEND == intent.action && "text/plain" == intent.type) {
      val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
      if (sharedText != null) {
        // Convert SHARE intent to DEEP LINK intent so Tauri can handle it natively
        intent.action = Intent.ACTION_VIEW
        intent.data = Uri.parse("qrscan://share?text=" + Uri.encode(sharedText))
      }
    }
  }
}
