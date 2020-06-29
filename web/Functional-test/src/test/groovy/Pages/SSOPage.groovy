import geb.Page
import java.util.regex.*
import io.github.cdimascio.dotenv.Dotenv

class SSOPage extends Page {
  static Dotenv dotenv = Dotenv.configure().directory("./").load()
  static at = { title == "Government of British Columbia" }
  static IDIRusername = dotenv.get("IDIR_USERNAME")
  static IDIRpassword = dotenv.get("IDIR_PASSWORD")

  static content = {
    username { $("input#user") }
    password { $("input#password") }
    submitButton { $("input[name='btnSubmit']")}
  }
}
