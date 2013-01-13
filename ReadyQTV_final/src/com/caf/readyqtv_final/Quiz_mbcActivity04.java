package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class Quiz_mbcActivity04 extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_mbc04);
	    // TODO Auto-generated method stub
	    
	    //ok button
	    Button button_oknext1 = (Button) findViewById(R.id.button_oknext1);
	    button_oknext1.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_oknext1 = new Intent(Quiz_mbcActivity04.this, Quiz_ads2Activity.class);
				startActivity(intent_oknext1);
				
			}
		});
	}

}
