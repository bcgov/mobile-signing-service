import geb.spock.GebReportingSpec
import spock.lang.*
import pages.*

@Title("Signing Homepage")
@Narrative("I can go to home page and login")
@Stepwise
@Ignore("Ignoring until there is a test IDIR account/password")
class  A_HomePageSpec extends GebReportingSpec {
  def "I see the home page"(){
    when:"I go to the homepage"
    to HomePage

    then: "I am not logged in"
    assert loginButton.text() == "LOGIN"

    and: "I click on login button"
    loginButton.click()

    then: "I should be redirected to the login page"
    at SSOPage
    
    and: "I enter my credential and submit"

    username.value(IDIRusername)
    password.value(IDIRpassword)
    submitButton.click()

    then: "I should be at homepage and logged in"
    at HomePage
    assert loginButton.text() == "LOGOUT"
  }
}
