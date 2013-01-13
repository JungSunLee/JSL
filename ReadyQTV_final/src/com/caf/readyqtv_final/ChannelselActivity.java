package com.caf.readyqtv_final;

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
	    // TODO Auto-generated method stub
	    
	    
	    //sbs
	    Button button_sbs = (Button) findViewById(R.id.button_sbs);
	    button_sbs.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_sbs = new Intent(ChannelselActivity.this, Channel_mbcActivity.class);
				startActivity(intent_sbs);
			}
		});
	    
	  //kbs1
	    Button button_kbs1 = (Button) findViewById(R.id.button_kbs1);
	    button_kbs1.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_kbs1 = new Intent(ChannelselActivity.this, Channel_mbcActivity.class);
				startActivity(intent_kbs1);
			}
		});
	    
	  //kbs2
	    Button button_kbs2 = (Button) findViewById(R.id.button_kbs2);
	    button_kbs2.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_kbs2 = new Intent(ChannelselActivity.this, Channel_mbcActivity.class);
				startActivity(intent_kbs2);
			}
		});
	    
	  //mbc
	    Button button_mbc = (Button) findViewById(R.id.button_mbc);
	    button_mbc.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent_mbc = new Intent(ChannelselActivity.this, Channel_mbcActivity.class);
				startActivity(intent_mbc);
			}
		});
	    
	    //tab button
	    
	    //lounge
	    Button button_lounge = (Button) findViewById(R.id.button_lounge);
	    button_lounge.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent1 = new Intent(ChannelselActivity.this, LoungeActivity.class);
				startActivity(intent1);
				
			}
		});
	    
	  //channel select
	    Button button_channelsel = (Button) findViewById(R.id.button_channelsel);
	    button_channelsel.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent2 = new Intent(ChannelselActivity.this, ChannelselActivity.class);
				startActivity(intent2);
				
			}
		});
	    
	  //store
	    Button button_store = (Button) findViewById(R.id.button_store);
	    button_store.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent3 = new Intent(ChannelselActivity.this, StoreActivity.class);
				startActivity(intent3);
				
			}
		});
	    
	  //setting
	    Button button_setting = (Button) findViewById(R.id.button_setting);
	    button_setting.setOnClickListener(new View.OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				Intent intent4 = new Intent(ChannelselActivity.this, SettingActivity.class);
				startActivity(intent4);
				
			}
		});
	}

}
