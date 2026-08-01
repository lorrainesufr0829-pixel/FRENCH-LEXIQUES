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