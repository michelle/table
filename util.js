var util = {
  generateString: function() {
    return Math.random().toString(36).substr(2,8);
  },
  configureUser: function(req) {
    req.session.user.gravatar = hash.md5(req.session.user.email);
  },
  email: function(to, subject, message){
    email.sendMail({
      to: to,
      from : 'Table Team <michelle@michellebu.com>',
      subject : subject,
      html : message
    }, function(err, result){
      if (err) console.log(err);
    });
  }
};

// if node
module.exports = util;
// end node
