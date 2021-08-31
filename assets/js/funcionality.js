// adidionar os valores no painel de transação
let transactions = [

];

function newTransaction(evt) {
  evt.preventDefault();
  // create am error alert if click the send button with void values

  let newTransaction = []
  newTransaction.push($('input#name').val(), $('input#date').val(), Number($('input#value').val()), 'AKZ');

  transactions.push(newTransaction);
  $('<tr class="transaction"><td class="name">' + newTransaction[0] + '</td><td class="date">' + newTransaction[1] + '</td><td class="price"><span class="value">' + newTransaction[2] + '</span><span class="moeda">' + newTransaction[3] + ' </span></td></tr>')
  .appendTo('table tbody');

  checkCredit();
    }

function checkCredit() {
  var incomes = 0;
  var outcomes = 0;
  var total = 0;
  
  for(let i = 0; i < transactions.length; i++){
  
    if(transactions[i][2] >= 0){
      incomes += transactions[i][2];
    }
    else {
      outcomes += transactions[i][2];
    }

    total = incomes + outcomes
    if(total < 0) {
      $('#total').addClass('negative');
    }
  }
    $('#transactionPanel')
    .find('ul')
      .find('#incomes .amount')
        .text(incomes)
      .end()

      .find('#outcomes .amount')
        .text(outcomes)
      .end()
      .find('#total .amount')
        .text(total)
      .end();


  let transaction = $('tbody .transaction').get();
  let value = $('tbody tr .price .value').get();

  for(let i = 0; i <= value.length - 1; i++) {
    if(Number(value[i].innerHTML) >= 0) {
     transaction[i].className = 'transaction in';
    }

    else {
      transaction[i].className = 'transaction out';
    }
  }  
}

// remove items from the list 
/*  for(var i=transactions.length; i>=0 ; i--) {
    console.log(transactions.pop().remove());  
  }
*/



(function ($) {
  $('#darkbg').hide();

for(let i = 0; i <= transactions.length - 1; i++) {
    $('<tr class="transaction"><td class="name">' + transactions[i][0] + '</td><td class="date">' + transactions[i][1] + '</td><td class="price"><span class="value">' + transactions[i][2] + '</span><span class="moeda">' + transactions[i][3] + '</span></td></tr>')
          .appendTo('table tbody');
}

  $('#recordTransiction')
    .find('form')
      .find('.btn#send').click(newTransaction)
    .end()

    .find('.btn#cancel, .btn#send').click(function() {
      $('#darkbg').fadeOut();
    })
    .end()
  .end()
    
    $('#transactionPanel')
    .find('#newTransaction')
      .click(function() {
        $('#darkbg').fadeIn();
      });

      $('#openMenu').click(function () {
        $('#menu').slideDown(500);
      });
    $('#menu')
      .hide()
        .find('ul')
          .find('#closeMenu')
            .click(function () {
              $('#menu').slideUp(500);
              //console.log('I\'m here!')

            })
          .end()
        .end();

        $('transaction')
    checkCredit();
}) (jQuery);