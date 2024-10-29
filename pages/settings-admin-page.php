<?php 
    $selectedLanguage = "";
    function AES_getSelectedLanguage(){
         $locale = strval(get_locale());
         switch ($locale) {
        
            case "en_US":
                $selectedLanguage = "English";
                break;
            case "es_ES":
                $selectedLanguage = "Espanol";
                break;
            case "fr_FR":
                $selectedLanguage = "Francais";
                break;
            case 'it_IT':
                $selectedLanguage = "Italiano";
                break;
            default:
                $selectedLanguage = "Italiano";
        }

        return $selectedLanguage;
    }
    function AES_updateLanguage(){
        $locale = strval(get_locale());
        delete_option('aes-alfred-locker-selected-lang');
        switch ($locale) {
            case "en_US":
                $selectedLanguage = "English";
                break;
            case "es_ES":
                $selectedLanguage = "Espanol";
                break;
            case "fr_FR":
                $selectedLanguage = "Francais";
                break;
            case 'it_IT':
                $selectedLanguage = "Italiano";
                break;
            default:
                $selectedLanguage = "Italiano";
        }
         if(!get_option('aes-alfred-locker-selected-lang')){
             add_option('aes-alfred-locker-selected-lang',  $selectedLanguage);
         }
    }
    AES_updateLanguage();


  if(isset($_REQUEST['aes_plugin_heading']))
  {
		$selectedTitle = sanitize_text_field($_REQUEST['aes_plugin_heading']);
		delete_option('aes_plugin_heading');
		if(!get_option('aes_plugin_heading')){
			add_option('aes_plugin_heading',  $selectedTitle);     
		}
		else{
			update_option('aes_plugin_heading',$selectedTitle);
		}
	}
	
/*	
	var_dump($_REQUEST);
	
	echo "<br><br><br>POST<br><br>";
	
	var_dump($_POST);
	
	echo "<br><br><br><br><br>";
*/	

   //include_once('wp-includes\option.php');
    if(isset($_POST['aes-alfred-plugin-username']) && isset($_POST['aes-alfred-plugin-password'])){ 
        $username =  sanitize_text_field($_POST['aes-alfred-plugin-username']);
        $password =  sanitize_text_field($_POST['aes-alfred-plugin-password']); 
        if(!get_option('aes-alfred-plugin-username')){
            add_option('aes-alfred-plugin-username', $username);
        }
        else{
            update_option('aes-alfred-plugin-username',$username);
        }
        if(!get_option('aes-alfred-plugin-password')){
            add_option('aes-alfred-plugin-password', $password);
        }
        else{
            update_option('aes-alfred-plugin-password',$password);
        }

        $url = AES_ALFREDWIDGET_LOGIN_URL; 
        $response = wp_remote_post( $url, array(
            'method' => 'POST',
            'headers' => array(
                "content-type"=> "application/json"
            ),
            'body' => 
                json_encode(
                    array( 
                    "user" => $username, 
                    "password" => $password 
                    )
                ),
           
            )
        );

        if ( is_wp_error( $response ) ) { 
           $error_message = $response->get_error_message();
           echo "Something went wrong: $error_message";
        } else {
            
            $body =  json_decode($response["body"]);
             if (isset($body->response_code) && $body->response_code == "400") {
                echo "<div style='color:red; text-align:center; margin:20px; font-size: 20px;'>" .$body->token."</div>";
             }
			 
             if(isset( $body->token)){ 
                $token = $body->token;
                if(!get_option('aes-alfred-plugin-token-new') && get_option('aes-alfred-plugin-token-new') != ''){
                    add_option('aes-alfred-plugin-token-new', $token);
					//echo get_option('aes-alfred-plugin-token-new');
                } else {
                    update_option('aes-alfred-plugin-token-new',$token);
                }
                /*delete_option('aes-alfred-plugin-username');
                delete_option('aes-alfred-plugin-password');*/
             }
        }
    }
 
    

 
    if (isset($_POST['aes-alfred-point-shipping-rate'])){
          update_option('aes-alfred-point-shipping-rate',sanitize_text_field($_POST['aes-alfred-point-shipping-rate']));
    }

    
   
    if( isset($_POST['aes-alfred-point-shipping-name'])){
        
        //why need to add this? not working without it lol?
        $shippingLanguageKey = "aes-alfred-point-shipping-lang".AES_getSelectedLanguage();
        delete_option($shippingLanguageKey);
        delete_option('aes-alfred-point-shipping-name');
        if(!get_option('aes-alfred-point-shipping-name')){
            add_option($shippingLanguageKey, sanitize_text_field($_POST['aes-alfred-point-shipping-name']));
            add_option('aes-alfred-point-shipping-name', sanitize_text_field($_POST['aes-alfred-point-shipping-name']));
        }
        else{
         
            update_option('aes-alfred-point-shipping-name',sanitize_text_field($_POST['aes-alfred-point-shipping-name']));
        }
    }
	
	
	
	if( isset($_POST['aes-alfred-logout']) && $_POST['aes-alfred-logout']==1){
		delete_option('aes-alfred-plugin-username');
		delete_option('aes-alfred-plugin-password');
		delete_option('aes-alfred-plugin-token-new');
	}
	
	
?>

<style>

    .body{
         
    }
    

    .body .field-group{
       
        display: flex !important;
        text-align: left !important;
        align-items:center !important;
        justify-content: start;
     
    }
     .field-group .control {
        flex-grow: 1 !important;
        border: solid 1px #032D2C !important;
       
        width: 100% !important;
        min-width:0 !important;
        max-width:100% !important;

       
       
        
    }

    .field-group  .label{
        margin: 10px !important;
        width: 80px !important;
       text-align: center;
    }

   
    .wocp_wrapper2 .alert {
        box-shadow : none !important;
        border: solid 1px #032D2C !important;
    }


    .wocp_wrapper2 .actions .button{
        background: #191E96 !important;
    }

    .wocp_wrapper2 .multitab-widget li a{
        background: #191E96 !important;
    }

    h1{
       color: #191E96 !important;
    }

    .wocp_wrapper2 .multitab-widget li a.multitab-widget-current {
        border: 1px solid #191E96;
        color: #fff !important;
    }

    .wp-person a:focus .gravatar, a:focus, a:focus .media-icon img{
        box-shadow : none !important;
    }
    

    @media only screen and (max-width: 480px) {
      .body .field-group{
       
       flex-direction: column !important;
        
     
      }
    }
</style>

<script>
/*var valore;
valore =<?php echo $_POST['exit']; ?>;
console.log('valore exit:' + valore);
*/
function logout(){
	document.getElementById("aes-alfred-logout").value = 1;
	console.log("logout user");
	document.getElementById("loginForm").submit(); 
}
</script>					  


<div class="wocp_wrapper2">
    <div align="center">
        <!--<h1>Alfred Easy Shipping</h1>-->
        <img src="<?php echo plugin_dir_url(dirname( __FILE__ )); ?>assets/img/logo.svg" width="250px"/>
        
    </div>
    <form method="post" class="woc-form" action="#" id="loginForm"> 
        <div class='multitab-section' style="margin-top: 50px;">
            <ul class='multitab-widget multitab-widget-content-tabs-id'>
                <li class='multitab-tab'><a href='#multicolumn-widget-id1'>Account</a></li>
                <li class='multitab-tab'><a href='#multicolumn-widget-id2'>Setting</a></li>
                <li class='multitab-tab'><a href='#multicolumn-widget-id3'>Spese di spedizione</a></li>
                <li class='multitab-tab'><a href='#multicolumn-widget-id4'>Lingue</a></li>
                <li class='multitab-tab'><a href='#multicolumn-widget-id5'>Errori di spedizione</a></li>
            </ul>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id1'>
                <div class="body" >
                    <div class="alert" align="left">
                       
                        <div class="alert__message">
                            <p>Grazie per avere scelto Alfred Easy Shipping</p>
                            <p>Abilita il ritiro al point in 2 semplici step</p>
                            <ol>
                                <li>Crea un account <a href="<?php echo AES_USER_LOGIN_URL; ?>">Alfred</a></li>
                                <li>Entra con il tuo utente Alfred</li>
                            </ol>
                            <p>Controlla lo stato degli ordini da  <a href="<?php echo AES_USER_ORDER_DASHBOARD_URL; ?>">qui</a></p>
                        </div>
                        
                    </div>
                    <hr />
                    <?php if(!get_option('aes-alfred-plugin-token-new')){?>
                    <div class="field-group">
                        <div class="label">Username</div>
                        <input type="text" class="control" placeholder="Username" value="<?php if(get_option('aes-alfred-plugin-username')){echo get_option('aes-alfred-plugin-username');}else{ echo "";}?>" id="aes-alfred-plugin-username" name="aes-alfred-plugin-username" />
                    </div>
                    <hr />
                    <div class="field-group">
                        <div class="label">Password</div>
                        <input type="password" class="control" placeholder="Password" value="<?php 
                               if(get_option('aes-alfred-plugin-password')){
                                   echo get_option('aes-alfred-plugin-password');
                               }
                               else{
                                   echo "";
                               }
                        
                            ?>" id="aes-alfred-plugin-password" name =  "aes-alfred-plugin-password" />
                    </div>
                    <?php }; ?>
                       <?php
                     
                      if(get_option('aes-alfred-plugin-token-new')){
                       ?> 
                         <div class="field-group">
                         <div class="label">Token</div>
                         <input type="text" disabled="disabled" class="control" value=<?php echo get_option('aes-alfred-plugin-token-new')?> id="aes-alfred-plugin-token" name="aes-alfred-plugin-token" />
                         </div> 
                       <?php
                    
                       }
                     
                      ?>
                </div>
            </div>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id2'>
                <div class="body">
                    <div class="field-group" align="right" style="visibility: hidden; display:none;">
                        <div class="label">Status</div>
                        <div class="select control">
                            <select>
                                <option>Disabled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="field-group">
                        <div class="label">Nome da visualizzare</div>
                        <input type="text" name="aes_plugin_heading" class="control" placeholder="" value="<?php 
                        
                        
                                      if(get_option('aes_plugin_heading')){
                                       
                                         echo get_option('aes_plugin_heading') ;
                                       }
                                      else{
               
                                                 
                                                 echo "Alfred Easy Shipping";
                                      }
                        ?>" />
                    </div>
                    <hr />
                    
                    <div class="field-group" align="right">
                        <div class="label">Default Tax Class</div>
                        <div class="select control">
                            <select>
                                <option>(Highest Product Tax Rate)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id3'>
                <div class="body">
                    <div class="field-group">
                        <div class="label">Alfred Point</div>
                        <input name='aes-alfred-point-shipping-rate'  type='number' class="control" placeholder="Euro (€)" 
                        value=<?php 
                               if(get_option('aes-alfred-point-shipping-rate')){
                                   echo get_option('aes-alfred-point-shipping-rate');
                               }
                               else{
                                   echo "";
                               }
                        
                            ?> />
                    </div>
                </div>
            </div>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id4'>
                <div class="body">
                    <div class="field-group" align="left">
                        <div class="select control"  >
                            <select  id="lang_select"  name="selectLangOption"  onchange="onChangeSelect()">
                                <option 
                                <?php 
                                  if (get_option('aes-alfred-locker-selected-lang') == "English"){
                                    
                                    echo "selected";
                                  }
                                  else{
                                      echo "disabled";
                                  }
                                  

                                
                                ?> value="English">English</option>
                                <option 
                                <?php if
                                   (get_option('aes-alfred-locker-selected-lang') == "Espanol")
                                   echo "selected";
                                   else{
                                      echo "disabled";
                                  }
                                
                                ?>
                                value="Espanol">Espanol</option>
                                <option 
                                <?php if
                                   (get_option('aes-alfred-locker-selected-lang') == "Francais")
                                   echo "selected";
                                   else{
                                      echo "disabled";
                                  }
                                
                                ?>
                                value="Francais">Francais</option>
                                <option 
                                <?php if
                                   (get_option('aes-alfred-locker-selected-lang') == "Italiano")
                                   echo "selected";
                                   else{
                                      echo "disabled";
                                  }
                                
                                ?>
                                value="Italiano">Italiano</option>
                            </select>
                        </div>
                    </div>

                    <script>
                       var selectedLang
                      function onChangeSelect(){
                           selectedLang = document.getElementById("lang_select").value;
                           console.log("selected lang", selectedLang)
                           updateAlfLockerVal()
                           AES_updateAlfPointVal()
                      }
					  
                    </script>
                    <hr />
                    <div class="field-group">
                        <div class="label">Alfred Point</div>
                        <input type="text" name = "aes-alfred-point-shipping-name" class="control" id="aes_alfred_point_shipping" placeholder="Enter Label For Alfred Point" value="<?php 
                              
                              $shippingLanguageKey = 'aes-alfred-point-shipping-lang'.AES_getSelectedLanguage();
                              if(get_option($shippingLanguageKey)){
                                   echo  htmlspecialchars(get_option($shippingLanguageKey));
                              }
                              else{
                                  echo "";
                              }
                        
                            ?>" /> 

                         <script>
                                console.log("2" ,selectedLang)
                                 function  AES_updateAlfPointVal(){
                           var alfredLockerLang = ""
                           switch(selectedLang) {
                             case "English":
                                // code block
                                alfredLockerLang = "Collect at Alfred Point"
                                break;
                             case "Espanol":
                                // code block
                                alfredLockerLang = "Recoge en el punto Alfred"
                                break;
                             case "Francais":
                                // code block
                                alfredLockerLang = "Retirer au point Alfred"
                                break;
                           
                             case "Italiano":
                                // code block
                                alfredLockerLang = "Ritira da Alfred point"
                                break;
                              default:
                                   alfredLockerLang = "Ritira da Alfred Point"
                                // code block
                            }

                             console.log( document.getElementById("aes_alfred_point_shipping"))   
                             document.getElementById("aes_alfred_point_shipping").value = alfredLockerLang;
                            }
                         </script>   
                    </div>
                </div>
            </div>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id5'>
                <div class="body">
                   
                </div>
            </div>
            <div class='multitab-widget-content multitab-widget-content-widget-id' id='multicolumn-widget-id6'>
                <div class="body">

                </div>
            </div>
        </div>
        <div class="actions" align="right">
            <!--<button class="button button--danger">Submit</button>
            <button class="button button--warning">Submit</button>-->
			<?php if( get_option('aes-alfred-plugin-username')) { ?>
			<input type="hidden" id="aes-alfred-logout" name="aes-alfred-logout" value="0">		
            <button class="button" onClick="logout()">Logout</button>
			<?php } ?>
            <input type="submit" class="button button--success" value="Salva">
           <!-- <button type="button"  class="button button--success>Submit</button> -->
        </div>
    </form>
</div>



