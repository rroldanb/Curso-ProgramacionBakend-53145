const UsersManager = require("../../dao/mongo/users.mongo.js");
const usersManager = new UsersManager();
class UsersViewsController {
  constructor() {}


  userProfile = async (req, res) => {
    const userId = req.params.uid;
    const requester = req.user;

    const user = await usersManager.getUserBy({_id:userId})
    if (!user) {
      return res.status(404).render('userProfile', { message: 'Usuario no encontrado' });
    }
    const formatDateHour = (date) => {
      if (!date){return ''}
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
  
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
  
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };
    const formatDate = (date) => {
      if (!date){return ''}
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()+1).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  const formattedDate = formatDate(user.birthDate);
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    let monthDiff = today.getMonth() - birth.getMonth();
    let dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
        monthDiff += 12; 
    }
    if (dayDiff < 0) {
        monthDiff--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        dayDiff += lastMonth.getDate(); 
    }

    return `${age} años ${monthDiff} meses ${dayDiff-1} días`;
};
  const formattedDateHour = formatDateHour(user.last_connection);
    res.render('userProfile', {
      userId: userId,
      first_name: user.first_name,
      last_name: user.last_name,
      last_connection: formattedDateHour,
      age: user.birthDate? calculateAge(user.birthDate):'',
      birthDate:formattedDate,
      email: user.email,
      profile_pic: user.documents.find(doc => doc.name === 'profile')?.reference || '',
      dni_pic: user.documents.find(doc => doc.name === 'dni')?.reference || '',
      domicilio_pic: user.documents.find(doc => doc.name === 'domicilio')?.reference || '',
      cta_pic: user.documents.find(doc => doc.name === 'cuenta')?.reference || '',
      styles: "homeStyles.css",
      requester,
      isPremium: user.role==='premium',
      isAdmin: user.role==='admin',
      requesterAdmin:requester.role==='admin',
    });
  };


  listUsers = async(req, res) =>{
    try {
        const users = await usersManager.getUsers({limit:20, page:1})
        res.render('users', {users:users.docs,
      styles: "homeStyles.css",

        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send("Error fetching users");
    }
  }

  resetPassword = async (req, res) => {
    const { token } = req.query;
    let expired = false
    let inValidToken = false
    if (!token) {
      return res.status(400).render("error", {
        title: "Error",
        message:
          "Token de restablecimiento no proporcionado. Por favor, verifica el enlace en tu correo o solicita uno nuevo.",
      });
    }

    try {

      const user = await usersManager.getUserBy({resetPasswordToken:token});
      if (!user) {
        inValidToken = true
        console.log('no user found')

      }
      if (user?.resetPasswordExpires < new Date()) {
        console.log("token expirado")
        expired = true
      }
      res.render("resetPassword", {
        title: "Restablecer Contraseña",
        styles: "homeStyles.css",
        token: token,
        expired, inValidToken
      });
    } catch (error) {
      console.error("Error while fetching user by reset token:", error);
      res.status(500).render("error", {
        title: "Error del servidor",
        message:
          "Ocurrió un error al intentar restablecer la contraseña. Por favor, intenta nuevamente más tarde.",
      });
    }
  };


  renderChat = async (req, res) => {
    const user = req.user;
    res.render("chat", {
      title: "Chat mercadito || RR-ecommerce",
      styles: "homeStyles.css",
      user: JSON.stringify(user),
      username: user.email,
    });
  }

}

module.exports = UsersViewsController;
