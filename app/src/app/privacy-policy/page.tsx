import Link from "next/link"

import { Home } from "@/assets/icons"

const PrivacyPolicy = () => (
   <>
      <Link href="/" className="fixed top-8 right-8 p-4 bg-black border-2 border-gray-7 rounded-lg z-10">
         <Home height={16} color="fill-white" />
      </Link>

      <div className="p-8 nav-tablet-large:px-24 text-white">
         <h1 className="text-4xl md:text-6xl font-bold">Privacy Policy</h1>
         <h6 className="mt-4 font-bold">Last updated June 01, 2023</h6>

         <p className="mt-12">
            This privacy notice for Eptastellar Inc. ("<span className="font-bold">we</span>," "<span className="font-bold">us</span>," or "<span className="font-bold">our</span>"), describes how and why we might collect, store, use, and/or share ("<span className="font-bold">process</span>") your information when you use our services ("<span className="font-bold">Services</span>"), such as when you:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>Visit our website at <a href="https://app-orbit.vercel.app" className="link">app-orbit.vercel.app</a>, or any website of ours that links to this privacy notice</li>
            <li>Download and use our mobile application (Orbit), or any other application of ours that links to this privacy notice</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
         </ul>

         <p className="mt-6">
            <span className="font-bold">Questions or concerns?</span> {" "}
            Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at eptastellar@gmail.com.
         </p>

         <h2 id="summary-of-key-points" className="mt-12 text-xl font-bold">
            SUMMARY OF KEY POINTS
         </h2>

         <p className="mt-6 font-bold italic">
            This summary provides key points from our privacy notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our <a href="#table-of-contents" className="link">table of contents</a> below to find the section you are looking for.
         </p>

         <p className="mt-6">
            <span className="font-bold">What personal information do we process?</span> {" "}
            When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about <a href="#personal-information-you-disclose-to-us" className="link">personal information you disclose to us</a>.
         </p>

         <p className="mt-6">
            <span className="font-bold">Do we process any sensitive personal information?</span> {" "}
            We do not process sensitive personal information.
         </p>

         <p className="mt-6">
            <span className="font-bold">Do we receive any information from third parties?</span> {" "}
            We do not receive any information from third parties.
         </p>

         <p className="mt-6">
            <span className="font-bold">How do we process your information?</span> {" "}
            We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about <a href="#how-we-process-your-information" className="link">how we process your information</a>.
         </p>

         <p className="mt-6">
            <span className="font-bold">In what situations and with which parties do we share personal information?</span> {" "}
            We may share information in specific situations and with specific third parties. Learn more about <a href="#when-and-with-whom-we-share-your-personal-information" className="link">when and with whom we share your personal information</a>.
         </p>

         <p className="mt-6">
            <span className="font-bold">How do we keep your information safe?</span> {" "}
            We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about <a href="#how-we-keep-your-information-safe" className="link">how we keep your information safe</a>.
         </p>

         <p className="mt-6">
            <span className="font-bold">What are your rights?</span> {" "}
            Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about <a href="#your-privacy-rights" className="link">your privacy rights</a>.
         </p>

         <p className="mt-6">
            Want to learn more about what we do with any information we collect? {" "}
            <a href="#table-of-contents" className="link">Review the privacy notice in full</a>.
         </p>

         <h2 id="table-of-contents" className="mt-12 text-xl font-bold">
            TABLE OF CONTENTS
         </h2>

         <ul className="flex flex-col mt-6 gap-2">
            <li><a href="#information-we-collect" className="link">
               1. WHAT INFORMATION DO WE COLLECT?
            </a></li>
            <li><a href="#how-we-process-your-information" className="link">
               2. HOW DO WE PROCESS YOUR INFORMATION?
            </a></li>
            <li><a href="#what-legal-bases-we-rely-on" className="link">
               3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?
            </a></li>
            <li><a href="#when-and-with-whom-we-share-your-personal-information" className="link">
               4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </a></li>
            <li><a href="#how-we-handle-your-social-logins" className="link">
               5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
            </a></li>
            <li><a href="#how-long-we-keep-your-information" className="link">
               6. HOW LONG DO WE KEEP YOUR INFORMATION?
            </a></li>
            <li><a href="#how-we-keep-your-information-safe" className="link">
               7. HOW DO WE KEEP YOUR INFORMATION SAFE?
            </a></li>
            <li><a href="#information-from-minors" className="link">
               8. DO WE COLLECT INFORMATION FROM MINORS?
            </a></li>
            <li><a href="#your-privacy-rights" className="link">
               9. WHAT ARE YOUR PRIVACY RIGHTS?
            </a></li>
            <li><a href="#controls-for-do-not-track-features" className="link">
               10. CONTROLS FOR DO-NOT-TRACK FEATURES
            </a></li>
            <li><a href="#updates-to-this-notice" className="link">
               11. DO WE MAKE UPDATES TO THIS NOTICE?
            </a></li>
            <li><a href="#contact-us-about-this-notice" className="link">
               12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a></li>
            <li><a href="#review-update-delete-the-data-we-collect" className="link">
               13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
            </a></li>
         </ul>

         <h2 id="information-we-collect" className="mt-12 text-xl font-bold">
            1. WHAT INFORMATION DO WE COLLECT?
         </h2>

         <h3 id="personal-information-you-disclose-to-us" className="mt-6 text-lg font-bold">Personal information you disclose to us</h3>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We collect personal information that you provide to us.
         </p>

         <p className="mt-6">
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
         </p>

         <p className="mt-6">
            <span className="font-bold">Personal Information Provided by You.</span> {" "}
            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>Names</li>
            <li>Email addresses</li>
            <li>Usernames</li>
            <li>Passwords</li>
         </ul>

         <p className="mt-6">
            <span className="font-bold">Sensitive Information.</span> {" "}
            We do not process sensitive information.
         </p>

         <p className="mt-6">
            <span className="font-bold">Social Media Login Data.</span> {" "}
            We may provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter, or other social media account. If you choose to register in this way, we will collect the information described in the section called "<a href="#how-we-handle-your-social-logins" className="link">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a>" below.
         </p>

         <p className="mt-6">
            <span className="font-bold">Application Data.</span> {" "}
            If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li><span className="italic">Mobile Device Access.</span> We may request access or permission to certain features from your mobile device, including your mobile device's camera, microphone, storage, and other features. If you wish to change our access or permissions, you may do so in your device's settings.</li>
            <li><span className="italic">Push Notifications.</span> We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out from receiving these types of communications, you may turn them off in your device's settings.</li>
         </ul>

         <p className="mt-6">
            This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.
         </p>

         <p className="mt-6">
            All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
         </p>

         <h2 id="how-we-process-your-information" className="mt-12 text-xl font-bold">
            2. HOW DO WE PROCESS YOUR INFORMATION?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
         </p>

         <p className="mt-6 font-bold">
            We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>
               <span className="font-bold">To facilitate account creation and authentication and otherwise manage user accounts.</span> {" "}
               We may process your information so you can create and log in to your account, as well as keep your account in working order.
            </li>
            <li><span className="font-bold">To save or protect an individual's vital interest.</span> {" "}
               We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.
            </li>
         </ul>

         <h2 id="what-legal-bases-we-rely-on" className="mt-12 text-xl font-bold">
            3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.
         </p>

         <p className="mt-6">
            The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>
               <span className="font-bold">Consent.</span> {" "}
               We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about <a href="#withdraw-your-consent" className="link">withdrawing your consent</a>.
            </li>
            <li>
               <span className="font-bold">Legal Obligations.</span> {" "}
               We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.
            </li>
            <li>
               <span className="font-bold">Vital Interests.</span> {" "}
               We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.
            </li>
         </ul>

         <h2 id="when-and-with-whom-we-share-your-personal-information" className="mt-12 text-xl font-bold">
            4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We may share information in specific situations described in this section and/or with the following third parties.
         </p>

         <p className="mt-6">
            We may need to share your personal information in the following situations:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>
               <span className="font-bold">Business Transfers.</span> {" "}
               We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </li>
         </ul>

         <h2 id="how-we-handle-your-social-logins" className="mt-12 text-xl font-bold">
            5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.
         </p>

         <p className="mt-6">
            Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
         </p>
         <p className="mt-6">
            We will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
         </p>

         <h2 id="how-long-we-keep-your-information" className="mt-12 text-xl font-bold">
            6. HOW LONG DO WE KEEP YOUR INFORMATION?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
         </p>

         <p className="mt-6">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than   the period of time in which users have an account with us.
         </p>
         <p className="mt-6">
            When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
         </p>

         <h2 id="how-we-keep-your-information-safe" className="mt-12 text-xl font-bold">
            7. HOW DO WE KEEP YOUR INFORMATION SAFE?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We aim to protect your personal information through a system of organizational and technical security measures.
         </p>

         <p className="mt-6">
            We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
         </p>

         <h2 id="information-from-minors" className="mt-12 text-xl font-bold">
            8. DO WE COLLECT INFORMATION FROM MINORS?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            We do not knowingly collect data from or market to children under 18 years of age.
         </p>

         <p className="mt-6">
            We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we have collected from children under age 18, please contact us at eptastellar@gmail.com.
         </p>

         <h2 id="your-privacy-rights" className="mt-12 text-xl font-bold">
            9. WHAT ARE YOUR PRIVACY RIGHTS?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
         </p>

         <p className="mt-6">
            In some regions (like the EEA, UK, and Switzerland), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section "<a href="#contact-us-about-this-notice" className="link">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>" below.
         </p>

         <p className="mt-6">
            We will consider and act upon any request in accordance with applicable data protection laws.
         </p>

         <p className="mt-6">
            If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your {" "}
            <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" target="_blank" className="link">Member State data protection authority</a> or {" "}
            <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" target="_blank" className="link">UK data protection authority</a>.
         </p>

         <p className="mt-6">
            If you are located in Switzerland, you may contact the <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" target="_blank" className="link">Federal Data Protection and Information Commissioner</a>.
         </p>

         <p id="withdraw-your-consent" className="mt-6">
            <span className="font-bold underline">Withdrawing your consent:</span> {" "}
            If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "<a href="#contact-us-about-this-notice" className="link">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>" below.
         </p>

         <p className="mt-6">
            However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
         </p>

         <h3 id="account-information" className="mt-6 text-lg font-bold">Account Information</h3>

         <p className="mt-6">
            If you would at any time like to review or change the information in your account or terminate your account, you can:
         </p>

         <ul className="flex flex-col mt-6 ml-5 gap-2 list-disc">
            <li>
               Log in to your account settings and update your user account.
            </li>
         </ul>

         <p className="mt-6">
            Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
         </p>

         <p className="mt-6">
            If you have questions or comments about your privacy rights, you may email us at eptastellar@gmail.com.
         </p>

         <h2 id="controls-for-do-not-track-features" className="mt-12 text-xl font-bold">
            10. CONTROLS FOR DO-NOT-TRACK FEATURES
         </h2>

         <p className="mt-6">
            Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.
         </p>

         <h2 id="updates-to-this-notice" className="mt-12 text-xl font-bold">
            11. DO WE MAKE UPDATES TO THIS NOTICE?
         </h2>
         <p className="mt-6 italic">
            <span className="font-bold">In Short:</span> {" "}
            Yes, we will update this notice as necessary to stay compliant with relevant laws.
         </p>

         <p className="mt-6">
            We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
         </p>

         <h2 id="contact-us-about-this-notice" className="mt-12 text-xl font-bold">
            12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
         </h2>

         <p className="mt-6">
            If you have questions or comments about this notice, you may email us at eptastellar@gmail.com.
         </p>

         <h2 id="review-update-delete-the-data-we-collect" className="mt-12 text-xl font-bold">
            13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
         </h2>

         <p className="mt-6">
            Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please visit: <a href="/settings" className="link">app-orbit.vercel.app/settings</a>.
         </p>
      </div>
   </>
)

export default PrivacyPolicy
