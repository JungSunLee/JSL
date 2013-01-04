package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class LoginActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {Log.v("ABC", "jsl");
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_login);
	    
	    Button button_pass = (Button) findViewById(R.id.button_pass);
	    button_pass.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent = new Intent(LoginActivity.this, ChannelselActivity.class);
				startActivity(intent);
			}
		});
	    
	    // TODO Auto-generated method stub
	}

}
