package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class LoginActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_login);
	    // TODO Auto-generated method stub
	    
	    Button button_pass = (Button) findViewById(R.id.button_pass);
	    button_pass.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_pass = new Intent(LoginActivity.this, ChannelselActivity.class);
				startActivity(intent_pass);
				
			}
		});
	}

}
