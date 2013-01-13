package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class Quiz_mbcActivity06 extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_mbc06);
	    // TODO Auto-generated method stub
	    
	  //결과창의 확인버튼
	    Button button_oknext = (Button) findViewById(R.id.button_oknext);
	    button_oknext.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_oknext = new Intent(Quiz_mbcActivity06.this, Quiz_ads3Activity.class);
				startActivity(intent_oknext);
				
			}
		});
	}

}
