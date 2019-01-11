/*
 *
 * Handlers File
 *
 */
const http = require('https');
const helpers = require('./helpers');

const handlers = {};

// Define Test Handler
handlers.test = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._test[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._test = {};

handlers._test.post = (data, callback) => {
  console.log('Test Data:', data.payload);
}

// Define User Handler
handlers.user = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._user[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub user handler method
handlers._user = {}

handlers._user.post = (data, callback) => {
  const payload = data.payload;
  const queryStringObject = data.queryStringObject;

  payload.external_id = helpers.hash(payload.email);
  delete payload.id;

  // In case to update the user
  if (typeof(queryStringObject.update) == 'string') {
    payload._update_existing_only = true;
  }
  const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        payload
      ]
    }
  const stringPostData = JSON.stringify(postData);

  // // An object of options to indicate where to post to
  var postOptions = {
    "method": "POST",
    "hostname": process.env.BRAZE_INSTANCE_URL,
    "path": '/users/track',
    "headers": {
      "Content-Type": "application/json",
      "cache-control": "no-cache"
    }
  };

  //Send post request to braze
  var req = http.request(postOptions, function (res) {
    console.log("response statusCode: ", res.statusCode);
    // Returning 301
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log('response end: ', body.toString());
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(stringPostData);
  req.end();
  callback(null, postData);
}

// Define Purchase Handler
handlers.purchase = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._purchase[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub user handler method
handlers._purchase = {}

handlers._purchase.post = (data, callback) => {
  const payload = data.payload;

  // Grab purchase items
  const purchaseItems = payload.line_items;

  // Customer id
  const customerEmail = payload.customer !== 'undefined' ? helpers.hash(payload.customer.email) : null;

  // Update required data
  purchaseItems.forEach(itemDetail => {
      itemDetail.product_id = itemDetail.name;
      itemDetail.time = payload.updated_at;
      itemDetail.external_id = customerEmail;
      itemDetail.discounted_price = parseFloat(itemDetail.discounted_price);
      itemDetail.line_price = parseFloat(itemDetail.line_price);
      itemDetail.original_line_price = parseFloat(itemDetail.original_line_price);
      itemDetail.original_price = parseFloat(itemDetail.original_price);
      itemDetail.price = parseFloat(itemDetail.price);
      itemDetail.currency = 'SGD';
      itemDetail.properties = {};
  });

  const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "purchases": payload.line_items
    }
  const stringPostData = JSON.stringify(postData);

  // // An object of options to indicate where to post to
  var postOptions = {
    "method": "POST",
    "hostname": process.env.BRAZE_INSTANCE_URL,
    "path": '/users/track',
    "headers": {
      "Content-Type": "application/json",
      "cache-control": "no-cache"
    }
  };

  //Send post request to braze
  var req = http.request(postOptions, function (res) {
    console.log("response statusCode: ", res.statusCode);
    // Returning 301
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log('response end: ', body.toString());
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(stringPostData);
  req.end();
  callback(null, postData);
}


handlers.get_omnisend_subscribers = (data, callback) => {
  // // An object of options to indicate where to post to
  var getOptions = {
    "method": "GET",
    "protocol": 'https:',
    "hostname": 'api.omnisend.com',
    "path": '/v3/contacts?limit=320&offset=0',
    "headers": {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.OMNISEND_API_KEY
    }
  };

  //Send get request to omnisend
  var req = http.request(getOptions, function (res) {
    console.log("response: ", res.statusCode);
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      // Process response back
      const response = body.toString();
      const jsonResponse = JSON.parse(response);
      jsonResponse.contacts.forEach(subscriber => {
        let subscriberEmail = subscriber.email;
        let hashedSubscriberEmail = helpers.hash(subscriberEmail);
        let subscriberCreatedAt = subscriber.createdAt;

        // Send post request to braze
        const subscriberPayload = {
          'external_id': hashedSubscriberEmail,
          'email': subscriberEmail,
          'createdAt': subscriberCreatedAt
        }

        const postData = {
          "api_key": process.env.BRAZE_API_KEY,
          "attributes": [
            subscriberPayload
          ]
        }
        const stringPostData = JSON.stringify(postData);

        // // An object of options to indicate where to post to
        var postOptions = {
          "method": "POST",
          "hostname": process.env.BRAZE_INSTANCE_URL,
          "path": '/users/track',
          "headers": {
            "Content-Type": "application/json",
            "cache-control": "no-cache"
          }
        };

        //Send post request to braze
        var req = http.request(postOptions, function (res) {
          console.log("response statusCode: ", res.statusCode);
          // Returning 301
          var chunks = [];

          res.on("data", function (chunk) {
            chunks.push(chunk);
          });

          res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log('response end: ', body.toString());
          });
        });

        req.on('error', function (e) {
          console.log('problem with request: ' + e.message);
        });

        // write data to request body
        req.write(stringPostData);
        req.end();
        callback(null, postData);
      });
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  req.on('timeout', function (e) {
    console.log('timout with request: ' + e.message);
  });
  req.end();
  callback(null, {'Success' : 'Fetched all subscribers'});
}


handlers.post_subscribers_braze = (data, callback) => {
  const subscribers = [
    "huimsicles@gmail.com",
    "cherylchew88@yahoo.com.sg",
    "evaeu@ymail.com",
    "thangayamarina@yahoo.com",
    "zzzzz78@gmail.com",
    "wenlee_8@yahoo.com.sg",
    "eyrakecik08@gmail.com",
    "lmarnellie@yahoo.com",
    "teh.karen@gmail.com",
    "glo_enriquez@yahoo.com",
    "hamma1924@yahoo.com",
    "hlypyng@live.com",
    "saheli60@hotmail.com",
    "kityeel@outlook.com",
    "lizysamueljacob@gmail.com",
    "shwetakhanna7777@gmail.com",
    "in_paradise_4eva@hotmail.com",
    "this.is.merlyn@gmail.com",
    "mallika2610@yahoo.com.sg",
    "jam.hashim@gmail.com",
    "cherlyntan79@gmail.com",
    "amandipetite@hotmail.com",
    "nancy501@ymail.com",
    "aipin_22@yahoo.com",
    "mariem.douville@st.com",
    "celinehor224@gmail.com",
    "slimpine@yahoo.com",
    "qingyi.ho@gmail.com",
    "cindyting95@gmail.com",
    "marcel.wessling@falcon-agency.com",
    "daniel.endres@falcon-agency.com",
    "nabeehabegum5656@gmail.com",
    "aileeang2011@gmail.com",
    "peifah_ho@yahoo.com.sg",
    "yi_ning_933@hotmail.com",
    "sweetshivani4u@gmail.com",
    "jcqlnkqn@yahoo.com.sg",
    "suriah_s@hotmail.com",
    "maria_hub@yahoo.com.sg",
    "leekweelian1@yahoo.com.sg",
    "feliciayap67@gmail.com",
    "hazel1175@gmail.com",
    "jenosor@zoho.com",
    "awinter-child@hotmail.com",
    "rohanna_0106@yahoo.com.sg",
    "yennnyin@gmail.com",
    "chongpy84@yahoo.com.sg",
    "alyssonlebardo@yahoo.com",
    "clchristine7@gmail.com",
    "shahirahfazil@hotmail.com",
    "jennlim125@hotmail.com",
    "alina.odintcova@falcon-agency.com",
    "ferndeng@gmail.com",
    "weyenlam@hotmail.com",
    "pquynh21288@yahoo.com",
    "monicat_68@hotmail.com",
    "lohseequek@outlook.com",
    "jann1994.lal@gmail.com",
    "annahussaini@outlook.com",
    "monsingh69@outlook.com",
    "hannahwye@gmail.com",
    "skoo43@yahoo.com.sg",
    "cleesf777@gmail.com",
    "collars88@yahoo.com",
    "yapvanessa@yahoo.com.sg",
    "michelletung23@gmail.com",
    "poonmohyeepauline@gmail.com",
    "rosalienegre2012@gmail.com",
    "mariatijunid089@gmail.com",
    "patjwjs@gmail.com",
    "deferia_monica@yahoo.com",
    "sheenasimyanqin@hotmail.com",
    "debrebudiao1023@gmail.com",
    "megangin1304@gmail.com",
    "titisatria71@gmail.com",
    "amysharm@yahoo.com.sg",
    "wingteo@yahoo.com.sg",
    "lokehere2014@gmail.com",
    "esteepph@yahoo.com.sg",
    "alicia.lian@hotmail.com",
    "lovelylhynz43@gmail.com",
    "babe_win@hotmail.com",
    "jenemma@hotmail.com",
    "cecilia.ppw@gmail.com",
    "yupeibinglin@hotmail.com",
    "minghui930721@gmail.com",
    "flyfoo79@gmail.com",
    "neha.wdh@gmail.com",
    "dollieswtluv@gmail.com",
    "danamavis@gmail.com",
    "chinjueling@gmail.com",
    "ng.laycheng@yahoo.com",
    "jovia84@yahoo.com.sg",
    "niharikachoudhury7@gmail.com",
    "limsusan74@gmail.com",
    "ivyreeves@hotmail.com",
    "cherylnghuifen111@hotmail.com",
    "verghie24@yahoo.com",
    "wanqi87@hotmail.com",
    "princess2110st@yahoo.com.sg",
    "l.xiaoying97@gmail.com",
    "incatech@hotmail.com",
    "triptamittal@gmail.com",
    "m.khairani14@gmail.com",
    "irahshopper@gmail.com",
    "susuen82@hotmail.com",
    "ssgiti@yahoo.com",
    "estherkyawtkhine@gmail.com",
    "theva_n@yahoo.com.sg",
    "rznrta@gmail.com",
    "tanchiong@hotmail.com",
    "joanne.carolyn@yahoo.com.sg",
    "amfanny@hotmail.com",
    "mousieng@yahoo.com.sg",
    "erynnleong@hotmail.com",
    "catleya.mendoza8@gmail.com",
    "elaineheng86@hotmail.com",
    "vanyipshan8282@yahoo.com",
    "galvicky@gmail.com",
    "helidor@hotmail.com",
    "khim0202@yahoo.com.sg",
    "simplymeh898@gmail.com",
    "p.gun.bhat@gmail.com",
    "aye.naw@gmail.com",
    "boo.lee15@gmail.com",
    "strwbrylover@gmail.com",
    "northcanal1@hotmail.com",
    "anabandejon2017@gmail.com",
    "melycampos27@yahoo.com.sg",
    "yann.chek@gmail.com",
    "maureentan29@gmail.com",
    "wifeyskitchen101@gmail.com",
    "loke_yenyen@yahoi.com",
    "ankitasehgal.2007@gmail.com",
    "jennyahgirl92@gmail.com",
    "wrouzhen@gmail.com",
    "hilhazz@hotmail.com",
    "dsarala73@yahoo.com.sg",
    "nurradhiah007@gmail.com",
    "dorisang3009@gmail.com",
    "lttthuong.ntky.91@gmail.com",
    "annieseahlh@hotmail.com",
    "nancy_teokarchoo@hotmail.com",
    "chang.ans68@gmail.com",
    "seetz1977@gmail.com",
    "khonghuimin@gmail.com",
    "hwlng_gh@yahoo.com.sg",
    "jessica80@live.com.sg",
    "hlakhinemyint2009@gmail.com",
    "contactasyeoh@gmail.com",
    "euniceshihui@gmail.com",
    "kfish9@hotmail.com",
    "zinmoethu18@gmail.com",
    "zainab.saniff@gmail.com",
    "alicelee77@hotmail.com",
    "nishapinkholic1506@gmail.com",
    "anakolp@live.com.sg",
    "zhiyunwang321@gmail.com",
    "happgal@singnet.com.sg",
    "jyuen@sas.edu.sg",
    "rilakkumacrystal23@gmail.com",
    "belinda_sunshine@hotmail.com",
    "leiravargas2000@gmail.com",
    "rosalie_1979@yahoo.com",
    "agneskesavan@ymail.com",
    "quekjt@gmail.com",
    "margzdelafuente@yahoo.com",
    "yma130900@gmail.com",
    "sarahnatrisya@gmail.com",
    "helentan31@gmail.com",
    "may79lj@gmail.com",
    "jennooisp80@yahoo.com",
    "nancyngp@gmail.com",
    "nehagoeln@yahoo.com",
    "sp177533@gmail.com",
    "linlye7008@gmail.com",
    "crystal18javier@gmail.com",
    "tongtong_20@hotmail.com",
    "pooh_yr@hotmail.com",
    "tanukanwar@gmail.com",
    "elisa_cmk@hotmail.com",
    "sharonongsl@yahoo.com.sg",
    "junkyan@yahoo.com",
    "betty74@hotmail.sg",
    "rosemus7270@hotmail.com",
    "mary_anne_tibay@yahoo.com",
    "chuashufen@gmail.com",
    "dorwee23@gmail.com",
    "theresa.osman@gmail.com",
    "joannence@hotmail.com",
    "chew_yen_ping@hotmail.com",
    "zurannie2304@gmail.com",
    "susantan@bmc.edu.sg",
    "jessicaz25@hotmail.com",
    "karendylan@yahoo.com.sg",
    "bloomzz@hotmail.com",
    "agnestan_21@yahoo.com",
    "csmelim@gmail.com",
    "a5m4h71@hotmail.com",
    "cv_christie@yahoo.com.sg",
    "innobella03@gmail.com",
    "rubycarlos27abrogena@gmail.com",
    "gigipenuela61@gmail.com",
    "eshivani@gmail.com",
    "carolineann_moon@hotmail.com",
    "carmelitagarnell362@gmail.com",
    "echalicor60@gmail.com",
    "rochellefayelegaspi@gmail.com",
    "ntaj.aziz@gmail.com",
    "jenllm@hotmail.com",
    "jlinda1964@live.com",
    "2012diamonddew@gmail.com",
    "san32loo@gmail.com",
    "priscillapey@gmail.com",
    "candytanhh@gmail.com",
    "ainienoras74@gmail.com",
    "gagsiangteo@yahoo.com",
    "lucykie@yahoo.com.sg",
    "andreanathanael@yahoo.co.uk",
    "fridasapon@gmail.com",
    "clar89@live.com.my",
    "evangeline_88@hotmail.com",
    "shwetamantri1@gmail.com",
    "melc_ellen@yahoo.com",
    "priscilla - 789@hotmail.com",
    "rozmelati@gmail.com",
    "juniscia_grace_rozario@yahoo.com",
    "irish.priela1975@yahoo.com.sg",
    "alvamanivasagam78@gmail.com",
    "deveraaubrey55@gmail.com",
    "consyew@gmail.com",
    "jy2404.je@gmail.com",
    "ice-fairy-46@hotmail.com",
    "janelc.ng@gmail.com",
    "sereneyeemp@yahoo.com.sgsere",
    "chewewok@yahoo.com.sg",
    "sufiyana.ar@gmail.com",
    "hongpeng.lim@gmail.com",
    "mkling36@gmail.com",
    "navdeep.er@gmail.com",
    "pennyphang54@gmail.com",
    "mscarol_1986gal@hotmail.com",
    "noora731201@hotmail.com",
    "idahsidah62@gmail.com",
    "xiaoying0722@gmail.com",
    "lcnmfavoured@gmail.com",
    "suvaathyraju@gmail.com",
    "aidahandjaja@hotmail.com",
    "sukyi_su@yahoo.com",
    "p_priya26@yahoo.com",
    "felicia_thng@hotmail.com",
    "zainabamat@yahoo.com.sg",
    "lelemoe77@gmail.com",
    "christinepineda0927@yahoo.com",
    "sudeeptad@aol.com",
    "annho@live.com.sg",
    "sereneyeemp@yahoo.com.sg",
    "susanwang53@gmail.com",
    "butterblue00@gmail.com",
    "jessefatima5@gmail.com",
    "geraldine.neo1@gmail.com",
    "rioriza72@gmail.com",
    "ilayepz81@yahoo.com",
    "shermaine24sg@yahoo.com.sg",
    "missmagtay@gmail.com",
    "jesslyn.lock@gmail.com",
    "sarahleong1954@gmail.com",
    "rdhansukhlal@gmail.com",
    "eddrynasyahartbelle7@gmail.com",
    "lim123christina@hotmail.com",
    "delacruz_jeanie@yahoo.com",
    "zannsoh75@gmail.com",
    "september.nge@gmail.com",
    "ashacas040180@gmail.com",
    "mmeow_ng@hotmail.com",
    "lawyuenmei@yahoo.com",
    "monanice@live.com.sg",
    "sereneloy@gmail.com",
    "wongleopard@yahoo.com.sg",
    "michellelinsi89@gmail.com",
    "asbah1808@gmail.com",
    "karenho234@yahoo.com.sg",
    "ultimatecharm123@gmail.com",
    "sheelakrish@hotmail.com",
    "livone37@hotmail.com",
    "juliachua7771@hotmail.com",
    "jennychee999@gmail.com",
    "angtenghui@yahoo.com.sg",
    "cindysys.siow@gmail.com",
    "zanirah99@gmail.com",
    "jroz01@yahoo.com.sg",
    "veronicawongwaileng@yahoo.com.sg",
    "bhakti.raje@gmail.com",
    "nunumawi125@gmail.com",
    "divinedivina@yahoo.com",
    "maharaniekasaputri3005@gmail.com",
    "cmyc16@gmail.com",
    "hejohanna4@gmail.com",
    "xiubei2012@gmail.com",
    "tanena@yahoo.com",
    "mine050619@gmail.com",
    "miegiangnguyen361988@gmail.com",
    "minnieraihan1224@gmail.com",
    "aprsdc@gmail.com",
    "misha.adriana@gmail.com",
    "ruthtan1997@gmail.com",
    "beifen.cindy@gmail.com",
    "cindy.8222@gmail.com",
    "esterchoo@ymail.com",
    "makcikjoyah66@gmail.com",
    "kwaiheng@hotmail.sg",
    "pandeyshweta@gmail.com",
    "iad01l@yahoo.com",
    "ladyrose2082@gmail.com",
    "jeslyn_1993@hotmail.com",
    "arlenegh@hotmail.com",
    "shini.vino@gmail.com",
    "joannetay838383@gmail.com",
    "christina520cn@hotmail.com",
    "salmah@deluge.com.sg",
    "tigeressrathi_lakhani@yahoo.com.sg",
    "erlijebe@gmail.com",
    "shari.gloria@gmail.com",
    "kyw1ns@yahoo.com",
    "94399345sc@gmail.com",
    "canilaohg@gmail.com",
    "eunice.lu19@gmail.com",
    "amandayubo@gmail.com",
    "fardizahassan@gmail.com",
    "monicaest71@yahoo.com",
    "hanyuwei.hywhyw@gmail.com",
    "ludivinavalenzuela481@gmail.com",
    "susannachin64@gmail.com",
    "lilavathd@gmail.com",
    "sng_ke@yahoo.com",
    "winnielrq@gmail.com",
    "navdeep@gmail.com",
    "busy_gal18@hotmail.com",
    "fauziahborhan75@gmail.com",
    "nganson63@gmail.com",
    "umifathan86.uf@gmail.com",
    "babunissa@gmail.com",
    "humerahasan@hotmail.com",
    "nuraleesya2015@gmail.com",
    "rowenatorreverde@yahoo.com",
    "isnapratama14@gmail.com",
    "yilinlou1@gmail.com",
    "sitiqrs@gmail.com",
    "allynecaritos05@gmail.com",
    "jingting_1995@hotmail.com",
    "sansankoh@gmail.com.sg",
    "shaynaloveswiss@gmail.com",
    "lucy.sgh@gmail.com",
    "liannalosaria@yahoo.com",
    "shida67@hotmail.com",
    "helen.tan2004@gmail.com",
    "lnaadat@yahoo.com.ph",
    "melchormaricelruiz@gmail.com",
    "naz_reen87@hotmail.com",
    "oindri_b@hotmail.com",
    "cherhsm@yahoo.com.sg",
    "renesgan@gmail.com",
    "angel6174@gmail.com",
    "toniycp73@gmail.com",
    "ms.sunshine3110@yahoo.com",
    "looloo_oh@yahoo.com",
    "mitkim@live.com",
    "krizlapuz12@gmail.com",
    "gina_cr18@yahoo.com.sg",
    "nurwartz22@gmail.com",
    "shantiniellen196@gmail.com",
    "tita_chung@yahoo.com",
    "vijitnj@rediffmail.com",
    "siddi2012hameed@gmail.com",
    "jasmine.shlen@gmail.com",
    "indirajkk@gmail.com",
    "eshkeerat@hotmail.com",
    "sgjo.macaraeg@gmail.com",
    "yvonnelimpn@yahoo.com",
    "sakshiguptasakshi124@gmail.com",
    "tangerinetan2001@yahoo.com",
    "anna.lisa@windowslive.com",
    "amanjoan1116@gmail.com",
    "lyeluzano@gmail.com",
    "ida.akemi.thomas@gmail.com",
    "galarritaedith1969@gmail.com",
    "findreane@yahoo.com",
    "cindyengsiewfong@gmail.com",
    "isha.isha4646@gmail.com",
    "mary.gamueda.pascua@gmail.com",
    "nicole.chew.jy@gmail.com",
    "chengsim.teo@gmail.com",
    "linkaiyuan_natalie@hotmail.com",
    "westmark.manoj@gmail.com",
    "livy_cm@yahoo.com",
    "hoonhoon_oh@hotmail.com",
    "lynntan510@gmail.com",
    "sonia.gorgeous@gmail.com",
    "jayashreeravi91@gmail.com",
    "stella8995@hotmail.com",
    "mdgupta1978@gmail.com",
    "leejustina@yahoo.com",
    "kristan79@hotmail.com",
    "sammi-ying99@hotmail.com",
    "dhiecy19@gmail.com",
    "fatimafayeabrams@gmail.com",
    "hkkhoospore@hotmail.com",
    "lizaroquearriola@gmail.com",
    "ma.julie_72@yahoo.com",
    "doelfit7306@gmail.com",
    "cynthia@tib.com.sg",
    "jeaniessm@yahoo.com.sg",
    "mslayeng@yahoo.com.sg",
    "margiebase27@yahoo.com",
    "raydadistor@yahoo.com",
    "rose_girlx@hotmail.com",
    "lch.fam@gmail.com",
    "huiyi_88_3@hotmail.com",
    "alyanarichelle_oracion@yahoo.com",
    "joyce.chuapk@gmail.com",
    "haruneaira@live.com",
    "jennifer.lachauna@yahoo.com",
    "miahsala16@gmail.com",
    "khinkhin7457@gmail.com",
    "almay.ureta77@gmail.com",
    "lovable_farrinnah8789@hotmail.com",
    "vrish69@gmail.com",
    "jaygun1527@gmail.com",
    "angsiewgek99@hotmail.com",
    "dharanhashani@gmail.com",
    "falcon@gmail.com",
    "chel_alemania@yahoo.com",
    "jojowongwongoilin@gmail.com",
    "madelenetumbali2018@gmail.com",
    "siti_sept@hotmail.com",
    "evelynseow@hotmail.com",
    "angelunderwrap@gmail.com",
    "ariyantikudrow@yahoo.com",
    "lewsj04@singnet.com.sg",
    "hweehua@hotmail.com",
    "rosnahbajuri@gmail.com",
  ];

  subscribers.forEach(subscriberEmail => {
    let hashedSubscriberEmail = helpers.hash(subscriberEmail);
    let subscriberCreatedAt = '2019-01-10T00:00:00Z';

    // Send post request to braze
    const subscriberPayload = {
      'external_id': hashedSubscriberEmail,
      'email': subscriberEmail,
      'createdAt': subscriberCreatedAt
    }

    const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        subscriberPayload
      ]
    }
    const stringPostData = JSON.stringify(postData);

    // // An object of options to indicate where to post to
    var postOptions = {
      "method": "POST",
      "hostname": process.env.BRAZE_INSTANCE_URL,
      "path": '/users/track',
      "headers": {
        "Content-Type": "application/json",
        "cache-control": "no-cache"
      }
    };

    //Send post request to braze
    var req = http.request(postOptions, function (res) {
      console.log("response statusCode: ", res.statusCode);
      // Returning 301
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log('response end: ', body.toString());
      });
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(stringPostData);
    req.end();
    callback(null, postData);
  });      
}
// Define Purchase Handler
handlers.omnisend = (data, callback) => {
  const acceptableMethods = ['get'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._omnisend[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._omnisend = {};

handlers._omnisend.get = (data, callback) => {
  EMAIL_ADDRESS_REGEX = new RegExp("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])");
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.match(EMAIL_ADDRESS_REGEX) !== null ? data.queryStringObject.email.trim() : false;

  
  if (email) {
    /*****************/ 
    //@TODO Update Omnisend separately with list id
    /*****************/

    // An object of options to indicate where to post to
    var options = {
      "method": "POST",
      "protocol": 'https:',
      "hostname": 'api.omnisend.com',
      "path": '/v3/contacts',
      "headers": {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.OMNISEND_API_KEY
      }
    };

    let postData = {
      email: email,
      lists: [{ listID: process.env.OMNISEND_LIST_ID }],
      status: 'subscribed',
      statusDate: new Date().toISOString()
    }

    let stringPostData = JSON.stringify(postData);
    console.log(stringPostData);    
  
    //Send post request to omnisend
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log('response end: ', body.toString());
      });
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(stringPostData);
    req.end();    

    /*****************/
    //@TODO Add subscriber to Braze too
    /*****************/

    const external_id = helpers.hash(email);
    postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        {
          "email": email,
          "external_id": external_id
        }
      ]
    }
    stringPostData = JSON.stringify(postData);

    // // An object of options to indicate where to post to
    var postOptions = {
      "method": "POST",
      "hostname": process.env.BRAZE_INSTANCE_URL,
      "path": '/users/track',
      "headers": {
        "Content-Type": "application/json",
        "cache-control": "no-cache"
      }
    };

    //Send post request to braze
    var req = http.request(postOptions, function (res) {
      console.log("response statusCode: ", res.statusCode);
      // Returning 301
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log('response end: ', body.toString());
      });
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(stringPostData);
    req.end();

    callback(200, stringPostData);
  }
}

handlers.sha1 = (data, callback) => {
  const queryStringObject = data.queryStringObject;
  const hashedEmail  = helpers.hash(queryStringObject.email);
  callback(null, { 'hashedEmail': hashedEmail} );
}

handlers.notFound = (data, callback) => {
  callback(404);
}

module.exports = handlers;
