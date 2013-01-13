package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

public class Quiz_adsActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_ads);
	    // TODO Auto-generated method stub
	    
	    Handler adsfor1 = new Handler();
	    adsfor1.postDelayed(new Runnable(){
	    	public void run() {
	    		Intent intent_adsfor1 = new Intent(Quiz_adsActivity.this, Quiz_mbcActivity03.class);
	    		startActivity(intent_adsfor1);
	    		
	    		finish();
	    	}
	    },1000);
	}

}
