// ================================
// Vocabulary Import
// ================================


const fileInput = document.getElementById("file-upload");


if(fileInput){


    fileInput.addEventListener(
        "change",
        function(event){


            const file = event.target.files[0];


            if(!file){
                return;
            }



            console.log("Selected file:", file.name);



            showImportMessage(file.name);



        }
    );


}




function showImportMessage(filename){


    const uploadBox = document.querySelector(".upload-box");


    if(!uploadBox){
        return;
    }



    const message = document.createElement("p");


    message.className = "upload-success";


    message.innerHTML = `

    Selected File:

    <strong>${filename}</strong>

    `;


    uploadBox.appendChild(message);



}
// ================================
// Add New Word
// ================================


const addButton = document.getElementById(
"add-word-btn"
);



if(addButton){


addButton.addEventListener(
"click",
()=>{


const word =
document.getElementById(
"new-word"
).value;



const meaning =
document.getElementById(
"new-meaning"
).value;



const category =
document.getElementById(
"new-category"
).value;



const level =
document.getElementById(
"new-level"
).value;





if(!word || !meaning){

alert(
"Please complete word and meaning"
);

return;

}





addVocabulary({

word,

meaning,

category,

level

});





alert(
"Vocabulary added successfully!"
);



}

);


}

// ================================
// Display Library
// ================================


const wordList = document.getElementById(
"word-list"
);



if(wordList){


const words = getVocabulary();



document.getElementById(
"word-count"
).innerText =
`${words.length} Words`;




words.forEach(item => {


const row = document.createElement(
"article"
);


row.className =
"word-row";



row.innerHTML = `


<div class="word-info">

<h3>
${item.word}
</h3>


<p>
${item.meaning}
</p>


</div>



<div class="word-tag">

<span>
${item.level || ""}
</span>


<span>
${item.category || ""}
</span>


</div>


`;



wordList.appendChild(row);



});


}

// ================================
// Import Excel Vocabulary
// ================================



if(fileInput){


fileInput.addEventListener(
"change",
function(event){


const file =
event.target.files[0];


if(!file){

return;

}



const reader =
new FileReader();



reader.onload = function(e){



const data =
new Uint8Array(
e.target.result
);



const workbook =
XLSX.read(
data,
{
type:"array"
}
);



const sheet =
workbook.Sheets[
workbook.SheetNames[0]
];



const rows =
XLSX.utils.sheet_to_json(
sheet
);





const vocabularyList =
rows.map(item=>({


word:item.Word,


meaning:item.Meaning,


category:"",


level:""


}));





saveImportedVocabulary(
vocabularyList
);



alert(
`${vocabularyList.length} words imported successfully!`
);



};



reader.readAsArrayBuffer(file);



}

);


}
