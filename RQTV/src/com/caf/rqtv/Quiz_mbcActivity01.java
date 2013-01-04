package com.caf.rqtv;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.ProgressBar;

public class Quiz_mbcActivity01 extends Activity {
	//private static final int PROGRESS = 0x1;
	private ProgressBar mProgress;
	private int mProgressStatus = 0;
	private Handler mHandler = new Handler();
	
		/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_mbc01);
	    // TODO Auto-generated method stub
	    
	    mProgress = (ProgressBar) findViewById(R.id.progressBar_quiz);
	    
	    
	    //백그라운드 스레드
	    new Thread (new Runnable(){
	    	@Override
	    	public void run() {
	    		
	    		while (mProgressStatus < 30) {
	    			Log.v("thread1", "backth run");
	   
	    				mProgressStatus += 1;
	    			
	    			
	    			mHandler.post(new Runnable() {
	    				@Override
	    				public void run() {
	    					Log.v("thread2", "handle in");
	    					mProgress.setProgress(mProgressStatus);
	    				}
	    			});
	    			try {
	    				Thread.sleep(300);
	    			} catch (InterruptedException e) {
	    				e.printStackTrace();
	    			}
	    		}
	    	}
	    }).start();
	 
	    Log.v("QWER","ab");
	  //스레드 부분
	    if(mProgressStatus == 29){
	    Handler quiz2 = new Handler();
        quiz2.postDelayed(new Runnable(){
        	public void run(){
        		Log.v("ABCD","abcd");
        		Intent intent = new Intent(Quiz_mbcActivity01.this, Quiz_mbcActivity02.class);
        		startActivity(intent);
        		
        		finish();
        	}
        }, 1500);}
     }
	}


