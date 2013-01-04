package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class Channel_kbs1Activity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_channel_kbs1);
	    
	    /** GAME START ACTIVITY BUTTON */
	    // ���� ���� ��ư
	    Button button_channelstart = (Button) findViewById(R.id.button_channelstart);
	    button_channelstart.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_channelstart = new Intent(Channel_kbs1Activity.this, Quiz_kbs1Activity01.class);
				startActivity(intent_channelstart);
			}
		});
	    
	    // �����ư
	    Button button_channelexit = (Button) findViewById(R.id.button_channelexit);
	    button_channelexit.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_channelexit = new Intent(Channel_kbs1Activity.this, ChannelselActivity.class);
				intent_channelexit.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
				startActivity(intent_channelexit);
			}
		});
	    //��������� �������� ��ư
	    // TODO Auto-generated method stub
	}

}
