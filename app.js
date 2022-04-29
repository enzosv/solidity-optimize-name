(function ($) {
  function parseSignature(signature) {
    if (signature.charAt(signature.length - 1) != ')' || signature.indexOf(' ') !== -1) {
      return false;
    }
    var parts = signature.split('(');
    if (parts.length == 2) {
      return {
        name: parts[0],
        args: '(' + parts[1]
      };
    } else {
      return false;
    }
  }
  $(document).ready(function () {
    if (!window.Worker) {
      $('#error').html("your browser does not support workers")
      $('#error').show();
      return
    }
    const worker = new Worker("worker.js");
    $('#optimize').click(function () {
      var input = $('#input').val().replaceAll(" ", "");
      var after = $('#after').val();
      var data = parseSignature(input);
      if (!data) {
        $('#error').show();
        return;
      }
      $('#error').hide();
      $('#optimize').prop("disabled", true);
      $('#loader').show();
      worker.postMessage([data, after])

    });
    worker.onmessage = function (e) {
      $('#after').val(e.data[1])
      $('#output').append('<p>' + e.data[0] + ': 0x' + e.data[1] + '</p>')
      $('#loader').hide();
      $('#optimize').prop("disabled", false);
    }
  });
})(jQuery);