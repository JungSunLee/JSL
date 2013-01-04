package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class LoungeActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_loungerank);
	    
	    /** TAB ��ư ��� */
	  //lounge button
	    Button button_lounge = (Button) findViewById(R.id.button_lounge);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent1 = new Intent(LoungeActivity.this, LoungeActivity.class);
				startActivity(intent1);
				
				finish();
			}
		});
	    
	    
	    //ä�μ��� button
	    Button button_channelsel = (Button) findViewById(R.id.button_channelsel);
	    button_channelsel.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent2 = new Intent(LoungeActivity.this, ChannelselActivity.class);
				startActivity(intent2);
				
			}
		});
	    
	    //���� button
	    Button button_store = (Button) findViewById(R.id.button_store);
	    button_store.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent3 = new Intent(LoungeActivity.this, StoreActivity.class);
				startActivity(intent3);
			}
		});
	    
	    //ȯ�漳�� button
	    Button button_setting = (Button) findViewById(R.id.button_setting);
	    button_setting.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent4 = new Intent(LoungeActivity.this, SettingActivity.class);
				startActivity(intent4);
			}
		});
	    //��������� tab button group
	    // TODO Auto-generated method stub
	}

}
