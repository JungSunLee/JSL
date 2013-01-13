package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

public class Quiz_ads2Activity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_ads2);
	    // TODO Auto-generated method stub
	    
	    Handler adsfor2 = new Handler();
	    adsfor2.postDelayed(new Runnable(){
	    	public void run() {
	    		Intent intent_adsfor2 = new Intent(Quiz_ads2Activity.this, Quiz_mbcActivity05.class);
	    		startActivity(intent_adsfor2);
	    		
	    		finish();
	    	}
	    }, 1000);
	}

}
