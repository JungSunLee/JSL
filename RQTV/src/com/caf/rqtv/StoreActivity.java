package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class StoreActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_store);
	    
	    /** TAB 버튼 목록 */
	  //lounge button
	    Button button_lounge = (Button) findViewById(R.id.button_lounge);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent1 = new Intent(StoreActivity.this, LoungeActivity.class);
				startActivity(intent1);
			}
		});
	     
	    //채널선택 button
	    Button button_channelsel = (Button) findViewById(R.id.button_channelsel);
	    button_channelsel.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent2 = new Intent(StoreActivity.this, ChannelselActivity.class);
				startActivity(intent2);
			}
		});
	    
	    //상점 button
	    Button button_store = (Button) findViewById(R.id.button_store);
	    button_store.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent3 = new Intent(StoreActivity.this, StoreActivity.class);
				startActivity(intent3);
				
				finish();
			}
		});
	    
	    //환경설정 button
	    Button button_setting = (Button) findViewById(R.id.button_setting);
	    button_setting.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent4 = new Intent(StoreActivity.this, SettingActivity.class);
				startActivity(intent4);
			}
		});
	    //여기까지가 tab button group
	    // TODO Auto-generated method stub
	}

}
