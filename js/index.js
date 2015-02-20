/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    
    app_loaded: false,
    testing_on_desktop: true,
 
    init: function () {
		//alert("[init]"+document.URL.indexOf("http://"));
 
		if (document.URL.indexOf("http://") === -1) {
			app.testing_on_desktop = false;
		}
		
		jQuery(document).ready(function () {
			console.log("jQuery finished loading");
		 
			var deviceReadyDeferred = jQuery.Deferred();
			var jqmReadyDeferred    = jQuery.Deferred();
			if (app.testing_on_desktop) {
				console.log("PhoneGap finished loading");
				_onDeviceReady();
				deviceReadyDeferred.resolve();
			} else {
				document.addEventListener("deviceReady", function () {
					console.log("PhoneGap finished loading");
					_onDeviceReady();
					deviceReadyDeferred.resolve();
				}, false);
			}
		 
			jQuery(document).one("pageinit", function () {
				console.log("jQuery.Mobile finished loading");
				jqmReadyDeferred.resolve();
			});
		 
			jQuery.when(deviceReadyDeferred, jqmReadyDeferred).then(function () {
				console.log("PhoneGap & jQuery.Mobile finished loading");
				
				StatusBar.show();
				StatusBar.overlaysWebView(false);
				StatusBar.styleLightContent();
				StatusBar.backgroundColorByHexString("#1f1e2e");
				
				if (navigator.notification) { // Override default HTML alert with native dialog
					  window.alert = function (data) {
						  navigator.notification.alert(
							  data,    // message
							  null,       // callback
							  "Dealer", // title
							  'OK'        // buttonName
						  );
					  };
				}
				FastClick.attach(document.body);
				initPages();				
				console.log("App finished loading");
				app.app_loaded = true;
			});
		});		
	 
		function _onDeviceReady () {
			//PGproxy.navigator.splashscreen.hide();			
			console.log("[onDeviceReady] calling phonegap api functions");
		};
		function initPages () {			
			//alert("at page shown");
			//alert(localStorage.merchantEmail+localStorage.merchantPass+localStorage.getItem("merchantRememberme"));
			
			if (localStorage.getItem("merchantEmail") !== null) {
				$("#txtemail").val(localStorage.merchantEmail);
			}
			if (localStorage.getItem("merchantPass") !== null) {
				$("#txtpassword").val(localStorage.merchantPass);
			}
			if (localStorage.getItem("merchantRememberme") !== null) {					
				$('#chck-rememberme').prop('checked', true).checkboxradio('refresh');
			}
			else
			{
				$('#chck-rememberme').prop('checked', false).checkboxradio('refresh');
			}
			//page show events and operations
			$(document).on("pagebeforeshow","#coupon_page",function(e){ // When entering pagetwo
				if(localStorage.setNoCoupon=="yes")
				{
					//$( "#dlg-coupon-message" ).popup( "open" );					
					alert("No coupon left to send.Please contact Us to renew!");
				}
				else
					localStorage.setNoCoupon="no";
					
				var currentDate = new Date();					
				//var defaultValue = [currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]; 
				//$("#exp_date").datebox({'defaultValue' : defaultValue});
				//$('#exp_date').datebox('refresh');
				$('#exp_date').datebox('setTheDate', currentDate);
				$('#exp_time').datebox('setTheDate', currentDate);
			});
			
			$(document).on("pageshow","#login_page",function(e){ 
				// When entering login page chek whether user selects remember me button or not
				
			});
			
			$('#login-form').validate({
				rules: {					
					txtemail: {
						required: true,
						email: true
					},
					txtpassword: {
						required: true,						
					},
				},
				messages: {					
					txtemail: {
						required: "Please enter email."
					},
					txtpassword: {
						required: "Please enter password."
					},
				},
				errorPlacement: function (error, element) {
					//alert(error+element);
					error.insertAfter( element.parent() );
					//error.appendTo(element.parent().prev());
				},
				submitHandler: function (form) {
					//alert("in submit");
					
					if($("#chck-rememberme").is(":checked"))
					{
						localStorage.merchantEmail=$("#txtemail").val();
						localStorage.merchantPass=$("#txtpassword").val();
						localStorage.merchantRememberme=1;
					}
					else
					{
						 localStorage.removeItem("merchantEmail");
						 localStorage.removeItem("merchantPass");
						 localStorage.removeItem("merchantRememberme");						 
					}
					
					$.ajax({
						beforeSend: function() { $.mobile.loading("show"); }, //Show spinner
						complete: function() { $.mobile.loading("hide"); }, //Hide spinner
						url: web_url+"auth.php",
						data: { email: $("#txtemail").val(), pass: $("#txtpassword").val()},
						type: "POST",
						success: function(data) {
							//alert(data);
							if(data==0)
							{
								$( "#dlg-invalid-credentials" ).popup( "open" );
							}
							else
							{
								var merchantInfo = $.parseJSON(data);
								localStorage.merchantId=merchantInfo.id;
								localStorage.merchantName=merchantInfo.merchant;
								localStorage.totalCoupons=merchantInfo.total_coupon;
								localStorage.totalUsers=merchantInfo.total_users;
								localStorage.latitude=merchantInfo.latitude;
								localStorage.longtitude=merchantInfo.longtitude;
								localStorage.cat=merchantInfo.cat;
								$("#total_users").text(merchantInfo.total_users);
								if(merchantInfo.total_coupon==0)
								{
									$('#send_coupon').val("No coupon left Contact Us to Renew!");									
									$('#send_coupon').attr('disabled','disabled');
									$('#title').attr('disabled','disabled');
									$('#coupon_code').attr('disabled','disabled');
									$('#description').attr('disabled','disabled');
									$("#exp_date").parent("div").addClass("ui-disabled");
									$("#exp_time").parent("div").addClass("ui-disabled");
									
									$("#coupon_left").text("0");
									
									localStorage.setNoCoupon="yes";
									
									$(':mobile-pagecontainer').pagecontainer('change', '#coupon_page', {
										reload: false
									});									
								}
								else
								{					
									$('#send_coupon').val("Send coupon!");
									$('#send_coupon').removeAttr('disabled');
									$('#title').removeAttr('disabled');
									$('#coupon_code').removeAttr('disabled');
									$('#description').removeAttr('disabled');
									$("#exp_date").parent("div").removeClass("ui-disabled");
									$("#exp_time").parent("div").removeClass("ui-disabled");
									
									localStorage.setNoCoupon="no";
									$("#coupon_left").text(merchantInfo.total_coupon);
									$("#login-form")[0].reset();
									$(':mobile-pagecontainer').pagecontainer('change', '#coupon_page', {
										reload: false
									});
								}
							}
			
						}
					});
					//e.preventDefault();
					return false;
				}
			});
			
			//Validate send coupon form
			
			$('#coupon-form').validate({
				rules: {
					title: {
						required: true,						
					},
					coupon_code: {
						required: true,						
					},
					description: {
						required: true,						
					},				
					/*exp_date: {
						required: true,						
					},
					exp_time: {
						required: true,						
					},*/
				},
				messages: {					
					title: {
						required: "Please enter coupon title."
					},
					coupon_code: {
						required: "Please enter coupon code."
					},
					description: {
						required: "Please enter coupon description."
					},		
					/*exp_date: {
						required: "Please enter Expiry date of coupon."
					},
					exp_time: {
						required: "Please enter Expiry date of coupon."
					},*/
				},
				errorPlacement: function (error, element) {
					//alert(error+element);
					error.insertAfter( element.parent() );
					//error.appendTo(element.parent().prev());
				},
				submitHandler: function (form) {
					
					
					var exp_date = $('#exp_date').datebox('getTheDate');
					
					var date_year = exp_date.getFullYear();
					var date_month = exp_date.getMonth()+1;
					var date_day = exp_date.getDate();
					var fianl_date = date_year+"-"+date_month+"-"+date_day;
					
					var exp_time = $('#exp_time').datebox('getTheDate');
					
					var time_hour = exp_time.getHours();
					var time_minutes = exp_time.getMinutes();
					var fianl_time = time_hour+":"+time_minutes+":00";
					
					var custom_datetime = fianl_date+" "+fianl_time;
					var sharable="off";
					$("input[name=social-share]:checked").each(function() {
						sharable=$(this).val();
					});
					//alert($("#coupon_code").val());
					$.ajax({
						beforeSend: function() { $.mobile.loading("show"); }, //Show spinner
						complete: function() { $.mobile.loading("hide"); }, //Hide spinner
						url: web_url+"coupons.php",
						data: { mer_id: localStorage.merchantId, coupon_title: $("title").val(), coupon_code: $("#coupon_code").val(), description: $("#description").val(), expire_time: custom_datetime, merchant_name: localStorage.merchantName, lat: localStorage.latitude, lon: localStorage.longtitude, cat_ids: localStorage.cat, coupon_title: $("#title").val(), sharable: sharable},
						type: "POST",
						success: function(data) {							
							$("#coupon_left").text($("#coupon_left").text()-1);
							if($("#coupon_left").text()==0)
							{
								$("#coupon-form")[0].reset();
								alert("No coupon left to send.Please contact Us to renew!");
								
								$('#send_coupon').val("No coupon left Contact Us to Renew!");
								$('[type="submit"]').button('refresh');
								$('#send_coupon').attr('disabled','disabled');
								$('#title').attr('disabled','disabled');
								$('#coupon_code').attr('disabled','disabled');
								$('#description').attr('disabled','disabled');
								$("#exp_date").parent("div").addClass("ui-disabled");
								$("#exp_time").parent("div").addClass("ui-disabled");
									
								$("#coupon_left").text("0");
									
								localStorage.setNoCoupon="yes";
								
								//$( "#dlg-coupon-message" ).popup( "open" );
								
																
							}
							var gcmResult = $.parseJSON(data);
							
							alert("Seccussfully sent to : "+gcmResult.success_sent+" Devices");							
						}
					});
					//e.preventDefault();
					return false;
				}
			});
		}
	}
};

//app.initialize();
