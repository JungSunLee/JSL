package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

public class Quiz_ads3Activity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_ads3);
	    // TODO Auto-generated method stub
	    
	    Handler adsfor3 = new Handler();
	    adsfor3.postDelayed(new Runnable(){
	    	public void run() {
	    		Intent intent_adsfor3 = new Intent(Quiz_ads3Activity.this, Channel_mbcActivity.class);
	    		startActivity(intent_adsfor3);
	    		
	    		finish();
	    	}
	    }, 1000);
	}

}
