package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class ChannelselActivity extends Activity {

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_channelsel);
	    

	    /** TAB 버튼 목록 */
	    //lounge button
	    Button button_lounge = (Button) findViewById(R.id.button_lounge);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent1 = new Intent(ChannelselActivity.this, LoungeActivity.class);
				intent1.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
				startActivity(intent1);
			}
		});

	    //채널선택 button
	    Button button_channelsel = (Button) findViewById(R.id.button_channelsel);
	    button_channelsel.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent2 = new Intent(ChannelselActivity.this, ChannelselActivity.class);
				intent2.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
				startActivity(intent2);
				
				}
		});
	    
	    //상점 button
	    Button button_store = (Button) findViewById(R.id.button_store);
	    button_store.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent3 = new Intent(ChannelselActivity.this, StoreActivity.class);
				startActivity(intent3);
			}
		});
	    
	    //환경설정 button
	    Button button_setting = (Button) findViewById(R.id.button_setting);
	    button_setting.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent4 = new Intent(ChannelselActivity.this, SettingActivity.class);
				startActivity(intent4);
			}
		});
	    //여기까지가 tab button group
	    // TODO Auto-generated method stub
	    
	    /** CHANNEL SELECT & IN BUTTON */
	    
	    //sbs button
	    Button button_sbs = (Button) findViewById(R.id.button_sbs);
	    button_sbs.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_sbs = new Intent(ChannelselActivity.this, Channel_sbsActivity.class);
				startActivity(intent_sbs);
			}
		});
	        
	    //kbs1 button
	    Button button_kbs1 = (Button) findViewById(R.id.button_kbs1);
	    button_kbs1.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_kbs1 = new Intent(ChannelselActivity.this, Channel_kbs1Activity.class);
				startActivity(intent_kbs1);
			}
		});
	    
	    //kbs2 button
	    Button button_kbs2 = (Button) findViewById(R.id.button_kbs2);
	    button_kbs2.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_kbs2 = new Intent(ChannelselActivity.this, Channel_kbs2Activity.class);
				startActivity(intent_kbs2);
			}
		});
	    
	    //mbc button
	    Button button_mbc = (Button) findViewById(R.id.button_mbs);
	    button_mbc.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_mbc = new Intent(ChannelselActivity.this, Channel_mbcActivity.class);
				startActivity(intent_mbc);
			}
		});

	    //여기까지가 채널선택 버튼 그룹
	}

}
