import { Link } from "wouter";
import { RiTwitterFill, RiFacebookFill, RiInstagramFill, RiLinkedinFill } from "react-icons/ri";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-slate-400 hover:text-slate-500">
              <RiTwitterFill className="text-lg" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-500">
              <RiFacebookFill className="text-lg" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-500">
              <RiInstagramFill className="text-lg" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-500">
              <RiLinkedinFill className="text-lg" />
            </a>
          </div>
          <div className="mt-8 md:mt-0 flex flex-col sm:flex-row items-center justify-center md:justify-end">
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} CardFolio. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-2 sm:mt-0 sm:ml-4">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
