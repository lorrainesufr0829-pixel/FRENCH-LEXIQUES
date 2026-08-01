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