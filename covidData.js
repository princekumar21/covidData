const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const puppy = require("puppeteer");

//for taking PINCODE and AGE
let processData = process.argv[2];
let processData1 = process.argv[3];

request("https://www.mohfw.gov.in", callback);




function callback(error, response, html){
    if(!error){
        fs.writeFileSync('covidData.html', html);
        let $ = cheerio.load(html);

        //this will keep record of vaccination 
        let numberVaccine = $('.col-xs-8.site-stats-count.sitetotal .fullbol span');
        let InfoVaccine = $('.col-xs-2 .covidupdae');
        let todayVaccine = (($(numberVaccine[2]).text()).replace('(', '')).replace(')', '');
        let tillTodayVaccine = (($(numberVaccine[1]).text()).replace('(', '')).replace(')', '');
        let TotalVaccineText = ($(numberVaccine[0]).text());

        let covidstatement = $('.covidupdae');
        let statetext = ($(covidstatement[0]).text());
        let date = statetext.substring(29, 40);
        let time = statetext.substring(42);
        console.log();
        
        console.log("-----------------------------------------------------------------------------");
        console.log("COVID-19 VACCINATION INDIA STATS updated by "+ date +" " + time);
        console.log();

        console.log("                        ------------------                             ");
        console.log();

        //for covid tests done last day
        let tests = $('.tested');
        let test = (tests.text()).substring(50, 60);
        console.log("Test Done on " + (date.substring(0, 2) - 01) + date.substring(2, 11) +" :"+test);
        console.log();

        //for vaccination done today and till today
        console.log("Total Vaccination        : "+ tillTodayVaccine.substring(0));
        console.log("Total Vaccinations Today : " + todayVaccine);
        console.log();

        //total cases and new cases
        let activeCaseS = $('.bg-blue .mob-hide');
        let activeCase = $(activeCaseS[1]).text();
        console.log("Active Cases             : " + indian_System_separator(activeCase.substring(0, 7)));
        console.log("New Cases                : " + indian_System_separator(activeCase.substring(13, 18)));
        console.log();

        //total discharge and new discharge
        let dischargeCases = $('.bg-green .mob-hide');
        let dischargeCase = $(dischargeCases[1]).text();
        console.log("Total Discharged         : " + indian_System_separator(dischargeCase.substring(0, 8)));
        console.log("Discharged Today         : " + indian_System_separator(dischargeCase.substring(14, 20)));
        console.log();

        //total deaths and new deaths
        let deathCases = $('.bg-red .mob-hide');
        let deathCase = $(deathCases[1]).text();
        console.log("Total Death              : " + indian_System_separator(deathCase.substring(0, 6)));
        console.log("Death Today              : " + indian_System_separator(deathCase.substring(12, 16)));
        console.log("-----------------------------------------------------------------------------");
        console.log();

        main();
        
        

       
    }

}
   
async function main() {
    let browser = await puppy.launch({
        headless: false
    });
    
    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://www.cowin.gov.in/home");
    await tab.waitForSelector('#mat-input-0');
    
    await tab.click('#mat-input-0');
    await tab.type('#mat-input-0', processData);
    await tab.click('.pin-search-btn');
    await tab.waitForSelector('.form-check.nomargright label');
    let age = await tab.$$(".form-check.nomargright label", {waitUntil: 'networkidle2'});
    if(processData1 > 18 && processData1 <= 44 ){
        for(let i = 0; i < 1; i++){
            await tab.evaluate(function(ele){
                ele.click();
           }, age[0]);
        }
    }else if(processData1 >= 45){
        for(let i = 1; i <= 1; i++){
            await tab.evaluate(function(ele){
                ele.click();
           }, age[1]);
        }
    }
    
    //checking center is avail or not, waitting for that selector
    if (await tab.$('.main-slider-wrap.col.col-lg-3.col-md-3.col-sm-3.col-xs-12') !== null) {

        let slotS = await tab.$$(".vaccine-box.vaccine-box1.vaccine-padding", {waitUntil: 'networkidle2'});
        
        //here count will keep how many slot is open
        let count = 0;
        for(let i = 0; i < slotS.length; i++){
            let slotAvail = await tab.evaluate(function(ele){
                
                 return ele.innerText;
            }, slotS[i]);
            if(slotAvail){
                let arr = slotAvail.split('\n');
                if(arr[0] !== "Booked" && arr[0] !== "NA"){
                    count++
                }
            }
         }
         console.log("       DETAILS ABOUT SLOT AVAILABILITY AND VACCINE CENTRES IN YOUR AREA ");
         
         console.log("                        ------------------                             ");
         console.log();
         if(count == 0){
             console.log("---->>> SORRY, NO SLOT AVAILABLE FOR BOOKING IN YOUR AREA! TRY AGAIN AFTER A MOMENT <<<----")
         }else{
            console.log("---->>>  "+count+"  SLOTS ARE AVAILABLE FOR BOOKING IN YOUR AREA , HURRY! BOOK YOUR SLOT AND GET A JAB <<----");

         }
         
         console.log();
         

         //this will take centername and address
        await tab.waitForSelector('.main-slider-wrap.col.col-lg-3.col-md-3.col-sm-3.col-xs-12');
        let centreName = await tab.$$(".main-slider-wrap.col.col-lg-3.col-md-3.col-sm-3.col-xs-12 .center-name-title", {waitUntil: 'networkidle2'});
        let centreAdd = await tab.$$(".main-slider-wrap.col.col-lg-3.col-md-3.col-sm-3.col-xs-12 .center-name-text", {waitUntil: 'networkidle2'});
        console.log("      ---->> "+centreName.length +" VACCINATION CENTERS IS AVAILABLE NEAR YOU <<----");
         console.log();
        console.log("                  ---- Lists of Vaccination Centers ----");
        console.log();
        for(let i = 0; i < centreName.length; i++){
            let centrename = await tab.evaluate(function(ele){
                 return ele.innerText;
            }, centreName[i]);
            
            let centreadd = await tab.evaluate(function(ele){
                 return ele.innerText;
             }, centreAdd[i]);
     
         
             
             console.log();
             console.log("Center   : "+centrename);
             console.log("Address  : "+ centreadd);
             console.log();

            }

           
        
      }else {
        console.log("Soory, No Vaccination center is available in your area!");
      }

     browser.close();
       
    
}

//function is use to set numeric value to indian system
function indian_System_separator(num)
    {
        var x=num;
        x=x.toString();
        let lastThree = x.substring(x.length-3);
        let otherNumbers = x.substring(0,x.length-3);
        if(otherNumbers != '')
            lastThree = ',' + lastThree;
        var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        return(res);
    }
