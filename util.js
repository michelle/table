var util = {
  generateString: function() {
    return Math.random().toString(36).substr(2,8);
  },
  configureUser: function(req) {
    req.session.user.gravatar = hash.md5(req.session.user.email);
    if (req.session.user.type == 'free-plan') {
      req.session.user.max_concurrent_limit = 50;
      req.session.user.max_ip_limit = 50;
    } else {
      req.session.user.max_concurrent_limit = 100000;
      req.session.user.max_ip_limit = 100000;
    }
  },
  email: function(to, subject, message){
    email.sendMail({
      to: to,
      from : 'PeerJS Team <team@peerjs.com>',
      subject : subject,
      html : message
    }, function(err, result){
      if(err) console.log(err);
    });
  }
};

// if node
module.exports = util;
// end node
