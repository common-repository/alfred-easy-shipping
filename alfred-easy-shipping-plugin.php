<?php
/**
 * Plugin Name:		Alfred Easy Shipping
 * Plugin URI: 		
 * Description:		Offer pickup to retails stores
 * Version:			1.0.5
 * Author:			Alfred24 Tech srl
 * Domain Path:		/languages
 * License:			GPLv2
 * License URI:		http://www.gnu.org/licenses/gpl-2.0.txt
 */


//only run if theres no other class with this name


if (!class_exists('AlfredEasyShippingPlugin')) {
    class AlfredEasyShippingPlugin
    {
        /**
         * Constructor
         */
        public function __construct()
        {
            include("constants/constants.php");
            $this->AES_setup_actions();

            $this->AES_updatePluginLanguage();


            //updateLanguage();

        }



        /**
         * Setting up Hooks
         */
        public function AES_setup_actions()
        {
            //Main plugin hooks
            add_action('admin_menu', array($this, 'AES_my_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'AES_admin_enqueue_scripts'));
            add_action('woocommerce_after_shipping_rate', array($this, 'AES_addClickAndCollectWidget'),  10, 2);
        }


        function AES_getSelectedLanguage()
        {
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

        function AES_updatePluginLanguage()
        {
            $locale = strval(get_locale());
            $selectedLanguage = "";
            $defaultValuesAlfredLocker = "";
            $defaultValuesAlfredPoint = "";

            delete_option('aes-alfred-locker-selected-lang');

            switch ($locale) {

                case "en_US":
                    $selectedLanguage = "English";
                    $defaultValuesAlfredLocker = "Collect At Alfred Locker";
                    $defaultValuesAlfredPoint = "Collect At Alfred Point";
                    break;
                case "es_ES":
                    $selectedLanguage = "Espanol";
                    $defaultValuesAlfredLocker = "Recoger en el armario de Alfred";
                    $defaultValuesAlfredPoint = "Recoge en el punto Alfred";
                    break;
                case "fr_FR":
                    $selectedLanguage = "Francais";
                    $defaultValuesAlfredLocker = "Retirer à la consigne Alfred";
                    $defaultValuesAlfredPoint = "Retirer au point Alfred";
                    break;
                case 'it_IT':
                    $selectedLanguage = "Italiano";
                    $defaultValuesAlfredLocker = "Ritira da Alfred locker";
                    $defaultValuesAlfredPoint = "Ritira da Alfred point";
                    break;
                default:
                    $selectedLanguage = "Italiano";
                    $defaultValuesAlfredLocker = "Ritira da Alfred locker";
                    $defaultValuesAlfredPoint = "Ritira da Alfred point";
            }


            $shippingLanguageKeyAlfredPoint = "aes-alfred-point-shipping-lang" . $selectedLanguage;

            if (!get_option($shippingLanguageKeyAlfredPoint)) {
                add_option($shippingLanguageKeyAlfredPoint, $defaultValuesAlfredPoint);
                //add_option('alfred-point-shipping-name', $_POST['alfred-point-shipping-name']);
            }

            $shippingLanguageKeyAlfredLocker = "aes-alfred-locker-shipping-lang" . $selectedLanguage;

            if (!get_option($shippingLanguageKeyAlfredLocker)) {
                add_option($shippingLanguageKeyAlfredLocker, $defaultValuesAlfredLocker);
                //add_option('alfred-point-shipping-name', $_POST['alfred-point-shipping-name']);
            }
            if (!get_option('aes-alfred-locker-selected-lang')) {
                add_option('aes-alfred-locker-selected-lang',  $selectedLanguage);
            } else {
                update_option('aes-alfred-locker-selected-lang', $selectedLanguage);
            }
        }


        function AES_addClickAndCollectWidget($method, $index)
        {
            $chosen_methods = WC()->session->get('chosen_shipping_methods');
            $chosen_shipping = $chosen_methods[0];

            if (strpos($chosen_shipping, 'local_pickup') === 0 && strpos($method->get_id(), 'local_pickup') === 0)
                //if($chosen_shipping == "local_pickup:1" && $method->get_id() == "local_pickup:1")
                include("pages/easy-shipping-widget.php");
        }

        function AES_admin_enqueue_scripts()
        {
            $screen = get_current_screen();
            //var_dump($screen->id);
            if (strpos($screen->id, "alfredaesplugin") !== false) {
                wp_enqueue_style('wocp-style', plugin_dir_url(__FILE__) . 'assets/css/style.css');
                wp_enqueue_script('ewarrant_admin', plugin_dir_url(__FILE__) . 'assets/js/admin.js', array('jquery'), null, true);
            }
        }

        function AES_my_admin_menu()
        {
            add_menu_page('Alfred Easy Shipping', 'Alfred Easy Shipping', 'manage_options', 'alfredaesplugin-settings', array($this, 'AES_add_admin_page'), 'dashicons-location-alt', 6);
        }

        function AES_add_admin_page()
        {
            //include ("constants/constants.php");

            include("pages/settings-admin-page.php");
        }
    }



    add_filter('woocommerce_order_get_total', 'AES_custom_cart_total_final',10,2);
    function AES_custom_cart_total_final($order_total,$order_id)
    {
		$chosen_shipping = "";
		if (is_admin()) {
			$order = wc_get_order( $order_id );		
			foreach( $order->get_items( 'shipping' ) as $item_id => $item ){
				$chosen_shipping             = $item->get_method_id();
			} 
		} else {
			$chosen_methods = WC()->session->get('chosen_shipping_methods');
			$chosen_shipping = $chosen_methods[0];
		}

        if (strpos($chosen_shipping, 'local_pickup') === 0) {
            $lockerType = get_option('aes-alfred-selected-locationtype');

            $lockerPrice = 0;

            if ($lockerType == "ALFRED_LOCKER") {
                $lockerPrice = get_option('aes-alfred-locker-shipping-rate');
            } else {
                $lockerPrice = get_option('aes-alfred-point-shipping-rate');
            }



            $order_total += $lockerPrice;
        }

        return $order_total;
    }

    add_filter('woocommerce_thankyou_order_received_text', 'AES_d4tw_custom_ty_msg');

    function AES_d4tw_custom_ty_msg($thank_you_msg)
    {

        //str_replace("Local Pickup","Local Pickup", "Alfred Click & Collect");
        return $thank_you_msg;
    }

    // Get the WC_Order object from the Order ID



    add_filter('woocommerce_cart_shipping_method_full_label', 'AES_custom_shipping_method_labels', 10, 2);
    function AES_custom_shipping_method_labels($label, $method)
    {

        if (strpos($method->get_id(), 'local_pickup') === 0)
            //$label = "Alfred Click & Collect";

            if (!get_option('aes_plugin_heading')) {

                return "Alfred Easy Shipping";
            } else {

                $title = get_option('aes_plugin_heading');


                return $title;
            }
        else {
            return $label;
        }


        //return $label;
    }


    add_filter('woocommerce_checkout_fields', 'AES_misha_labels_placeholders', 20);

    function AES_misha_labels_placeholders($fields)
    {

        unset($fields['billing']['billing_state']);
        return $fields;
    }

    add_filter('woocommerce_order_shipping_to_display', 'AES_filter_email_shipping_text', 10, 2);

    function AES_filter_email_shipping_text($shipping, $order_id)
    {


        if ($shipping == "Local pickup") {
            if (!get_option('aes_plugin_heading')) {
                return "Alfred Easy Shipping";
            } else {
                $title = get_option('aes_plugin_heading');


                return $title;
            }
        }

        return $shipping;
    }
    add_action('woocommerce_thankyou', 'AES_ceb_order_complete', 10, 1);
    function AES_ceb_order_complete($order_id)
    {

        if (!$order_id)
            return;

        // Getting an instance of the order object
        $order = wc_get_order($order_id);
        // echo "<pre>";
        // print_r($order);
        // echo "</pre>";
        // exit;

        foreach( $order->get_items( 'shipping' ) as $item_id => $item ){
            $chosen_shipping             = $item->get_method_id();
        }

        if (strpos($chosen_shipping, 'local_pickup') === 0) {
        
            $order_firstname = $order->get_shipping_first_name();
            $billing_phone  = $order->get_billing_phone();
            $recipientEmail  = $order->get_billing_email();
            $recipientAddress  = $order->get_billing_address_1();
            $order_data = $order->get_data();
            $senderPhone = $billing_phone;
            $senderEmail = $recipientEmail;
            $senderAddress =$recipientAddress;
            $senderName =$order_firstname;

            $alfred_order['id'] = $order_id;
            $alfred_order['order_raw']['id'] = $order_id;
            $alfred_order['order_raw']['point']['idPoint'] = get_option('alfred-selected-locationID');
            $alfred_order['receiver'] = $order_data['shipping'];
            $alfred_order['receiver']['email'] = $order_data['billing']['email'];
            $alfred_order['receiver']['phone'] = $order_data['billing']['phone'];
            $alfred_order['receiver']['firstname'] = $alfred_order['receiver']['first_name'];
            $alfred_order['receiver']['state'] = $order_data['shipping']['country'];
            unset($alfred_order['receiver']['first_name']);
            $alfred_order['receiver']['lastname'] = $alfred_order['receiver']['last_name'];
            unset($alfred_order['receiver']['last_name']);
            $alfred_order['receiver']['address1'] = $alfred_order['receiver']['address_1'];
            unset($alfred_order['receiver']['address_1']);
            $alfred_order['receiver']['address2'] = $alfred_order['receiver']['address_2'];
            unset($alfred_order['receiver']['address_2']);
            $i = 0;
            foreach ($order->get_items() as $item_key => $item ) {
                $alfred_order['items'][$i]['id'] = $item->get_product_id();
                $alfred_order['items'][$i]['product_name']    = $item->get_name(); // Name of the product
                $alfred_order['items'][$i]['quantity']     = $item->get_quantity();  
                $i++;
            }
            
            //echo '<pre>'; print_r($alfred_order);
            $full_order = json_encode($alfred_order, JSON_PRETTY_PRINT);
            $order_items = count($alfred_order['items']);
            
            $token = AES_signIn($order_id, $billing_phone, $recipientEmail, $recipientAddress, $order_firstname, $senderPhone, $senderEmail, $senderAddress, $senderName, $full_order, $order_items);
        }

        if ($order->is_paid() || $order->has_status('processing') || $order->has_status('completed')) {
            global $wpdb;
            $payID = WC()->session->get('payID');
            if (!empty($payID)) {
                if (!$wpdb->update($wpdb->prefix . "ceb_registrations", array("paid" => 1), array("payID" => $payID))) {
                    die("ERROR IN PAYMENT COMPLETE");
                }
            }
        } else {
            //die("WASNT PAID");
        }
    }
    function AES_themeslug_enqueue_script()
    {
        wp_enqueue_script('aes-easywidgetjs', plugin_dir_url(__FILE__) . "pages/easywidgetSDK/easywidget.js", array('jquery'), null, true);
        $script_params = array('path' =>  plugin_dir_url(__FILE__));
        wp_localize_script('aes-easywidgetjs', 'scriptParams', $script_params);
    }

    function AES_signIn($order_id, $billing_phone, $recipientEmail, $recipientAddress, $order_firstname, $senderPhone, $senderEmail, $senderAddress, $senderName, $full_order, $order_items)
    {
        $username =  get_option('aes-alfred-plugin-username');
        $password =  get_option('aes-alfred-plugin-password');

        $url = AES_ALFREDWIDGET_LOGIN_URL;

        $response = wp_remote_post($url, array(
            'method' => 'POST',
            'headers' => array(
                "content-type" => "application/json"
            ),
            'body' =>
            json_encode(
                array(
                    "user" => $username,
                    "password" => $password
                )
            ),

        ));

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo "Something went wrong: $error_message";
        } else {

            $body =  json_decode($response["body"]);
            $token = $body->token;

            AES_completeOrder($token, $order_id, $billing_phone, $recipientEmail, $recipientAddress, $order_firstname, $senderPhone, $senderEmail, $senderAddress, $senderName, $full_order, $order_items);

            if (!get_option('aes-alfred-plugin-token-new')) {
                add_option('aes-alfred-plugin-token-new', $token);
            } else {
                update_option('aes-alfred-plugin-token-new', $token);
            }

            return $token;
        }

        return "";
    }



    function AES_completeOrder($token, $order_id, $billing_phone, $recipientEmail, $recipientAddress, $order_firstname, $senderPhone, $senderEmail, $senderAddress, $senderName, $full_order, $order_items)
    {
        // var_dump($token, $order_id, $billing_phone, $recipientEmail, $recipientAddress, $order_firstname, $senderPhone, $senderEmail, $senderAddress, $senderName,get_option('alfred-selected-locationID'));
        // exit;
        $url = AES_ALFREDWIDGET_SHIPMENTS_URL;

        $response = wp_remote_post($url, array(
            'method' => 'POST',
            'headers' => array(
                "content-type" => "application/json",
            ),
            'body' =>
            json_encode(
                array(
                    "apitoken" => $token,
                    "full_order" => $full_order,
                    "order_items" => $order_items,
                    "serviceType" => (get_option('alfred-selected-locationID') != 0) ? "point" : "domicilio",
                    "id_order" => $order_id,
                    "locationId" => get_option('alfred-selected-locationID'),
                    "recipientPhone" => $billing_phone,
                    "recipientEmail" => $recipientEmail,
                    "recipientAddress" => $recipientAddress,
                    "recipientName" => $order_firstname,
                    "senderPhone" => $senderPhone,
                    "senderEmail" => $senderEmail,
                    "senderAddress" => $senderAddress,
                    "senderName" => $senderName
                )

            ),

        ));

        //echo '<pre>'; var_dump($response);

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo "Something went wrong: $error_message";
        } else {
			delete_option('alfred-selected-locationID');
            $body =  json_decode($response["body"]);
            //echo $token;

        }
    }
    add_action('wp_enqueue_scripts', 'AES_themeslug_enqueue_script');


    add_action('woocommerce_review_order_before_order_total', 'AES_custom_cart_total');
    add_action('woocommerce_before_cart_totals', 'AES_custom_cart_total');
    function AES_custom_cart_total()
    {

        $chosen_methods = WC()->session->get('chosen_shipping_methods');
        $chosen_shipping = $chosen_methods[0];

        //strpos($chosen_shipping, 'local_pickup') === 0 
        if (strpos($chosen_shipping, 'local_pickup') === 0) {
            $lockerType = get_option('aes-alfred-selected-locationtype');

            $lockerPrice = 0;

            if ($lockerType == "ALFRED_LOCKER") {
                $lockerPrice = get_option('aes-alfred-locker-shipping-rate');
            } else {
                $lockerPrice = get_option('aes-alfred-point-shipping-rate');
            }



            WC()->cart->total += $lockerPrice;
        }
    }

    



    new AlfredEasyShippingPlugin();
}
