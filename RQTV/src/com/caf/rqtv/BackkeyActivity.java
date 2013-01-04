package com.caf.rqtv;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.KeyEvent;
import android.widget.Toast;

public class BackkeyActivity extends Activity {

	private Handler mHandler;
	private boolean mFlag = false;
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    mHandler = new Handler(){
	    	@Override
	    	public void handleMessage(Message msg){
	    		if(msg.what == 0) {
	    			mFlag = false;
	    		}
	    	}
	    };
	
	    // TODO Auto-generated method stub
	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if(keyCode == KeyEvent.KEYCODE_BACK) {
			if(!mFlag) {
				Toast.makeText(this, "뒤로 버튼을 한번 더 누르시면 종료됩니다.", Toast.LENGTH_SHORT).show();
				mFlag = true;
				mHandler.sendEmptyMessageDelayed(0, 2000);
				return false;
			} else{
				finish();
			}
		}
		return super.onKeyDown(keyCode, event);
	}

}
