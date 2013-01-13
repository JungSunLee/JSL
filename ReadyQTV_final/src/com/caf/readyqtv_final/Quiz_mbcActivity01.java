package com.caf.readyqtv_final;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.ProgressBar;

public class Quiz_mbcActivity01 extends Activity {
	private ProgressBar mProgress;
	private int mProgressStatus = 0;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_quiz_mbc01);
	    // TODO Auto-generated method stub
	    
	    mProgress = (ProgressBar) findViewById(R.id.progressBar_quiz);
	    new AccumulateTask().execute(0);
	}
	
	class AccumulateTask extends AsyncTask <Integer, Integer, Integer> {
		
		protected void onPreExecute() {
			Log.v("one","one");
			mProgressStatus = 0;
		}
		
		protected Integer doInBackground(Integer...arg0){
			while(true) {
				try {Thread.sleep(100);} catch(InterruptedException e){;}
				Log.v("two","two");
				mProgressStatus++;
				
				if(mProgressStatus <= 100) {
					Log.v("three","three");
					mProgress.setProgress(mProgressStatus);
				}
				else {
					break;
				}
				}
			return mProgressStatus;
		}
		
		protected void onProgressUpdate(Integer...progress) {
			Log.v("four","four");
			mProgress.setProgress(mProgressStatus);
		}
		
		protected void onPostExecute(Integer result) {
			if(mProgressStatus == 101) {
				Log.v("five","five");
				Intent intent_pg = new Intent(Quiz_mbcActivity01.this, Quiz_mbcActivity02.class);
				startActivity(intent_pg);
			}
		}
		
		protected void onCancelled(){
			
		}
	}
}


