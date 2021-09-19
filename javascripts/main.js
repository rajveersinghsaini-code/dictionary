const DICTIONARY_API_URL =
  "https://api.dictionaryapi.dev/api/v2/entries/en_US/";
const search_result = document.querySelector("div#search_result");

//Clear the previous screen if it has child controls
const clearSearchResult = () => {
  while (search_result.firstChild) {
    search_result.removeChild(search_result.firstChild);
  }
};

//Method do display no result if API return any error
const displayNoResult = () => {
  clearSearchResult();
  let divNoResultFound = document.createElement("div");
  divNoResultFound.className = "";
  divNoResultFound.append("No definitions found for this word.");
  search_result.appendChild(divNoResultFound);
};

//Main method to render dynamic search result
const createDefinitionCard = (resultJson) => {
  if (resultJson === null || resultJson === undefined) {
    displayNoResult();
    return;
  }
  //Definition Card
  let divDefCard = document.createElement("div");
  divDefCard.className = "result-card";

  //Search Word
  let searchWord = document.createElement("p");
  searchWord.className = "font-bold";
  searchWord.appendChild(document.createTextNode(resultJson.word));
  divDefCard.append(searchWord);

  //phonetic text and audio control
  if (
    resultJson.phonetics !== null &&
    resultJson.phonetics !== undefined &&
    resultJson.phonetics.length > 0
  ) {
    const phonetics = resultJson.phonetics[0];

    if (phonetics && Object.keys(phonetics).length > 0) {
      let phoneticText = document.createElement("p");
      //phonetic audio buttton
      let phoneticAudioButton = document.createElement("button");
      phoneticAudioButton.className = "audio-button";
      phoneticAudioButton.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
      phoneticAudioButton.addEventListener("click", function () {
        const music = new Audio("https:" + phonetics.audio);
        music.play();
      });
      phoneticText.appendChild(phoneticAudioButton);
      phoneticText.appendChild(document.createTextNode(phonetics.text));
      divDefCard.append(phoneticText);
    }
  }

  //Add Origin
  if (resultJson.origin !== undefined) {
    let originWord = document.createElement("p");
    originWord.appendChild(
      document.createTextNode("Origin: " + resultJson.origin)
    );
    divDefCard.append(originWord);
  }
  //Append Meaning to main result container
  if (resultJson.meanings !== undefined) {
    resultJson.meanings.forEach((meaning) =>
      divDefCard.appendChild(createMeaningsCard(meaning))
    );
  }
  //Append to main result section
  search_result.appendChild(divDefCard);
};

const createMeaningsCard = (meaningJson) => {
  let divMeaningCard = document.createElement("div");
  if (meaningJson !== null && meaningJson != undefined) {
    //Part of Speach Word
    if (meaningJson.partOfSpeech !== undefined) {
      let partOfSpeechText = document.createElement("p");
      partOfSpeechText.className = "font-bold";
      partOfSpeechText.appendChild(
        document.createTextNode(meaningJson.partOfSpeech)
      );
      divMeaningCard.append(partOfSpeechText);
    }

    const definitions = meaningJson.definitions;
    let meaningCount = 1;
    if (definitions !== undefined) {
      definitions.forEach((item) => {
        //Definition Paragraph
        if (item.definition !== undefined) {
          let definitionPara = document.createElement("p");
          definitionPara.className = "definition-paragraph";
          definitionPara.appendChild(
            document.createTextNode(
              meaningCount.toString() + ". " + item.definition
            )
          );
          divMeaningCard.append(definitionPara);
        }
        //Example Paragraph
        if (item.example !== undefined) {
          let examplePara = document.createElement("p");
          examplePara.className = "definition-example";
          examplePara.appendChild(document.createTextNode("- " + item.example));
          divMeaningCard.append(examplePara);
        }
        //Synonyms
        if (item.synonyms !== undefined && item.synonyms.length > 0) {
          let synonymsHeader = document.createElement("span");
          synonymsHeader.append("synonyms: ");
          divMeaningCard.append(synonymsHeader);
          item.synonyms.forEach((synonyms) => {
            let synonymsText = document.createElement("span");
            synonymsText.className = "badge";
            synonymsText.append(document.createTextNode(synonyms));
            synonymsText.addEventListener("click", function () {
              synonymsAntonymsClick(synonyms);
            });
            divMeaningCard.append(synonymsText);
          });
        }
        //Antonyms
        if (item.antonyms !== undefined && item.antonyms.length > 0) {
          divMeaningCard.append(document.createElement("br"));
          let antonymsHeader = document.createElement("span");
          antonymsHeader.append("antonyms: ");
          divMeaningCard.append(antonymsHeader);
          item.antonyms.forEach((antonyms) => {
            let antonymsText = document.createElement("span");
            antonymsText.className = "badge";
            antonymsText.append(document.createTextNode(antonyms));
            antonymsText.addEventListener("click", function () {
              synonymsAntonymsClick(antonyms);
            });
            divMeaningCard.append(antonymsText);
          });
        }
        //Increase Meaning counter
        meaningCount++;
      });
    }
  }
  return divMeaningCard;
};

const synonymsAntonymsClick = (searchText) =>{
  document.querySelector("#search_input").value = searchText;
  fetchDefinition();
};

//Make Dictionary API Call and generate dynamic result
const fetchDefinition = () => {
  const search_input = document.querySelector("#search_input").value;
  if (search_input !== undefined && search_input !== "") {
    fetch(DICTIONARY_API_URL + search_input)
      .then(function (response) {
        if (response.status !== 200) {
          console.log("There was a problem. Status Code: " + response.status);
          displayNoResult();
          return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
          clearSearchResult();
          if (data !== undefined && data !== null) {
            data.forEach((jsonData) => {
              createDefinitionCard(jsonData);
            });
          }
        });
      })
      .catch(function (err) {
        console.log("Fetch Error: ", err);
      });
  }
};
//Add event on textbox and search button
(function () {
  const search_submit = document.querySelector("#search_submit");
  search_submit.addEventListener("click", function () {
    fetchDefinition();
  });
  // Get the input field
  const search_input = document.querySelector("#search_input");
  search_input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      search_submit.click();
    }
  });
})();
