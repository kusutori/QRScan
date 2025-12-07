package com.kusut.qrscan

import android.os.Bundle
import android.media.MediaScannerConnection
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
  
  // Note: To truly refresh the gallery, we would need to expose a method here
  // and call it from Rust via JNI when a file is saved. 
  // For now, the file is safely in Downloads, accessible via Files app.
}
