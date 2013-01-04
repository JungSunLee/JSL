package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class TabbuttonActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_tabbutton);
	    
	    //lounge button
	    Button button_lounge = (Button) findViewById(R.id.button_lounge);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent = new Intent(TabbuttonActivity.this, LoungeActivity.class);
				startActivity(intent);
			}
		});
	        
	    //ä�μ��� button
	    Button button_channelsel = (Button) findViewById(R.id.button_channelsel);
	    button_channelsel.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent2 = new Intent(TabbuttonActivity.this, ChannelselActivity.class);
				startActivity(intent2);
			}
		});
	    
	    //���� button
	    Button button_store = (Button) findViewById(R.id.button_store);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent3 = new Intent(TabbuttonActivity.this, StoreActivity.class);
				startActivity(intent3);
			}
		});
	    
	    //ȯ�漳�� button
	    Button button_setting = (Button) findViewById(R.id.button_setting);
	    button_setting.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent4 = new Intent(TabbuttonActivity.this, SettingActivity.class);
				startActivity(intent4);
			}
		});
	    // TODO Auto-generated method stub
	}

}
