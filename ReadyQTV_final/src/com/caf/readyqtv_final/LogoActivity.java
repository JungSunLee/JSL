package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.Menu;

public class LogoActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_logo);
        
        Handler logox = new Handler();
        logox.postDelayed(new Runnable(){
        	public void run(){
        	Intent intent_logox = new Intent(LogoActivity.this, LoginActivity.class);
        	startActivity(intent_logox);
        	
        	finish();
        }
    },1500);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_logo, menu);
        return true;
    }
    
}
