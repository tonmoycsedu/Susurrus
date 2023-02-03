function init_questions(chartNumber,subjective=false,div="#chart_div"){

	getQA(chartNumber,subjective,div)

}

function getQA(chartNumber,subjective,div){
	$.ajax({
      url: '/getQA',
      data: JSON.stringify({chartNumber:chartNumber,subjective:subjective}),
      type: 'POST',
      success: function(res){
				if(!subjective)	populateQA(res.qa[0],div)
				else populateSUS(res.qa[0],div)
      },
      error: function(error){
          console.log("error !!!!");
      }
  });
}

function populateQA(QA,div){
	console.log(QA)
	var numberQAs = QA.answers.length
	questions = QA.questions
	answers = QA.answers
	for(i=0;i<numberQAs;i++){
		q = questions[i]
		as = answers[i]
		$(div).append('<b>'+q+'</b><br/>')
		as.forEach(function(a,j){
			$(div).append('<input type="radio"'+
   									'name="Q-'+i+'">'+
    								'<label for=Q-'+i+'">'+a+'</label><br/>')
		})
		$(div).append('<br/>')
		// $("#chart_div").hide()

	}
}

function populateSUS(QA,div){
	console.log(QA)
	// $("#chart_div1").empty()
	var numberQAs = QA.questions.length
	questions = QA.questions
	answers = QA.answers
	as = answers[0]
	for(i=0;i<numberQAs;i++){
		q = questions[i]
		ans = as
		if( i == 4) ans = answers[1]

		$(div).append('<b>'+q+'</b><br/>')
		ans.forEach(function(a,j){
			$(div).append('<input type="radio"'+
   									'name="Q-'+i+'">'+
    								'<label for=Q-'+i+'">'+a+'</label><br/>')
		})
		$(div).append('<br/>')
		// $("#chart_div").hide()

	}
	$(div).append('<b>Please provide any additional feedback (optional)</b><br/>')
	$(div).append('<textarea id="w3review" name="w3review" rows="10" cols="100">')
}
