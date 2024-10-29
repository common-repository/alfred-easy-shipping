<?php

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

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST["shippingAddress1"])) {
    //set_billing_state
    //WC()->customer->set_billing_address_1(wc_clean($_POST["shippingAddress1"]));
    //WC()->customer->set_billing_address_2(wc_clean($_POST["shippingAddress2"]));
    //WC()->customer->set_billing_city(wc_clean($_POST["region"]));
    //WC()->customer->set_billing_state(wc_clean($_POST["region"]));
    $shippingAddress = wc_clean($_POST["locationType"]) . " " . wc_clean($_POST["locationName"]) . " " . wc_clean($_POST["shippingAddress1"]);
    WC()->customer->set_shipping_address(wc_clean($shippingAddress));
    WC()->customer->set_shipping_city(wc_clean($_POST["city"]));
    WC()->customer->set_shipping_state(wc_clean($_POST["region"]));
    //WC()->customer->set_shipping_province(wc_clean($_POST["region"]));
    WC()->customer->set_shipping_postcode(wc_clean($_POST["postalCode"]));
    if (!get_option('alfred-selected-locationtype')) {
        add_option('alfred-selected-locationtype', wc_clean($_POST["locationType"]));
    } else {
        update_option('alfred-selected-locationtype', wc_clean($_POST["locationType"]));
    }
    if (!get_option('alfred-selected-locationID')) { // non funge
        add_option('alfred-selected-locationID', wc_clean($_POST['locationId']));
    } else {
        update_option('alfred-selected-locationID', wc_clean($_POST['locationId']));
    }
    WC()->customer->save();
    die();
}
?>

<style>
    .outlineAlfred {
        margin: 5px;
        padding: 15px;
        background: #eeeeee;
        display: flex;
        flex-direction: column;
    }

    #firstRadio {

        text-align: left;
        padding-top: 10px;
        width: 100%;
    }

    #secondRadio {
        text-align: left;
        padding-top: 10px;
        padding-bottom: 10px;
        width: 100%;
    }

    @media only screen and (max-width: 767px) and (min-width: 442px) {
        .outlineAlfred {
            flex-direction: row;
        }
    }
</style>

<div class="outlineAlfred">
    <div id="secondRadio">
        <input type="radio" id="aes_alfred_locker_point" name="aes_alfred_locker_point" value="aes_alfred_locker_point" onchange="on_change('alfred_point')">
        <label for="aes_alfred_locker_point">
            <?php
            $shippingLanguageKey = 'aes-alfred-point-shipping-lang' . AES_getSelectedLanguage();
            if (get_option($shippingLanguageKey)) {
                echo  htmlspecialchars(get_option($shippingLanguageKey));
            } else {
                echo "Collect At Alfred Point";
            }
            ?>
        </label>
        </input>
    </div>
</div>

<script>
    //inject mapbox 
    let loader = document.createElement("div");
    loader.className = "loader";
    loader.id = "loader";

    let mapBoxWP = document.createElement("div");
    mapBoxWP.className = "mapBox";
    mapBoxWP.id = "mapBox";
    mapBoxWP.appendChild(loader);

    let mapWrapper = document.createElement("div");
    mapWrapper.className = "mapWrapper";
    mapWrapper.id = "mapWrapper";
    mapWrapper.appendChild(mapBoxWP)


    let modalContainer = document.createElement("div");
    modalContainer.className = "modal";
    modalContainer.id = "modal";
    modalContainer.appendChild(mapWrapper)

    console.log("modalContainer", modalContainer)
    document.body.appendChild(modalContainer);
</script>



<script>
    let selection = ""
    var modal = document.getElementById("modal");

    function on_change(val) {
        modal.classList.add("showModal");
        document.getElementById('aes_alfred_locker_point').checked = false;
        selection = "Alfred Point";
        initEasyWidget('ALFRED_POINT');
    }
</script>

<script>
    document.addEventListener("DOMContentLoaded", function(event) {
        let data;
        var getData = (arg) => {
            let dataContainer = document.getElementById("dataContainer");
            dataContainer.innerHTML = JSON.stringify(arg, censor(arg));
        };

        function censor(censor) {
            var i = 0;
            return function(key, value) {
                if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
                    return '[Circular]';
                if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
                    return '[Unknown]';
                ++i; // so we know we aren't using the original object anymore
                return value;
            }
        }
        const toggleShowData = () => {
            let dataContainer = document.getElementById("dataContainer");
            if (dataContainer.style.display === "none") {
                dataContainer.style.display = "block"
            } else {
                dataContainer.style.display = "none"
            }
        };
    });
</script>


<script>
    function initEasyWidget(locationType) {
        var getData = (arg) => {
            console.log(arg);
            //console.log("gondsa", arg.address1En)
            jQuery.ajax({
                url: document.URL,
                type: "POST",
                processData: true,
                data: {
                    shippingAddress1: arg.address1En,
                    shippingAddress2: arg.address2En,
                    locationId: arg.locationId,
                    region: arg.province,
                    country: arg.country,
                    city: arg.city,
                    locationType: arg.locationType,
                    postalCode: arg.postalCode,
                    locationName: arg.companyName
                },
                success: function(data) {
                    //console.log(data);
                    //console.log("data");
                }
            });
        }
        if (_mapType !== undefined) {
            easyWidget.reset({
                filter: {
                    locationType: [locationType],
                    onSelect: getData

                }
            })
        } else {
            //console.log("easyWiget map 70", _mapType)
            let username = "<?=get_option('aes-alfred-plugin-username')?>"
            let password = "<?=get_option('aes-alfred-plugin-password')?>"
            let token = "<?=get_option('aes-alfred-plugin-token-new')?>"
            //all properties are null at first
            easyWidget.init({
                mapType: "osm",
                defaultLocation: "IT",
                mode: "modal",
                locale: "it",
                userAuthObject: {
                    token:token
                },
                filter: {
                    locationType: [locationType],

                },
                onSelect: getData
            });
            //console.log(username)
        }
    }
</script>